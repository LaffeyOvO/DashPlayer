import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import * as os from 'os';
import { DpTaskState } from '@/backend/db/tables/dpTask';
import { storeGet } from '@/backend/store';
import RateLimiter from '@/common/utils/RateLimiter';
import SrtUtil, { SrtLine } from '@/common/utils/SrtUtil';
import hash from 'object-hash';
import StrUtil from '@/common/utils/str-util';
import ErrorConstants, { isErrorCancel } from '@/common/constants/error-constants';
import { inject, injectable } from 'inversify';
import DpTaskService from '../DpTaskService';
import TYPES from '@/backend/ioc/types';
import ChildProcessService from '@/backend/services/ChildProcessService';
import FfmpegService from '@/backend/services/FfmpegService';
import UrlUtil from '@/common/utils/UrlUtil';
import WhisperService from '@/backend/services/WhisperService';

interface WhisperResponse {
    language: string;
    duration: number;
    text: string;
    offset: number;
    segments: {
        seek: number;
        start: number;
        end: number;
        text: string;
    }[];
}

interface SplitChunk {
    offset: number;
    filePath: string;
}

function toSrt(whisperResponses: WhisperResponse[]): string {
    whisperResponses.sort((a, b) => a.offset - b.offset);
    let counter = 1;
    const lines: SrtLine[] = [];
    for (const wr of whisperResponses) {
        for (const segment of wr.segments) {
            lines.push({
                index: counter,
                start: segment.start + wr.offset,
                end: segment.end + wr.offset,
                contentEn: segment.text,
                contentZh: ''
            });
            counter++;
        }
    }
    return SrtUtil.toNewSrt(lines);
}


@injectable()
class WhisperServiceImpl implements WhisperService {
    @inject(TYPES.DpTaskService)
    private dpTaskService: DpTaskService;

    @inject(TYPES.ChildProcessService)
    private childProcessService: ChildProcessService;

    @inject(TYPES.FfmpegService)
    private ffmpegService: FfmpegService;

    public async transcript(taskId: number, filePath: string) {
        if (StrUtil.isBlank(storeGet('apiKeys.openAi.key')) || StrUtil.isBlank(storeGet('apiKeys.openAi.endpoint'))) {
            this.dpTaskService.fail(taskId, {
                progress: '未设置 OpenAI 密钥'
            });
            return;
        }
        // await this.whisper();
        this.dpTaskService.checkCancel(taskId);
        this.dpTaskService.process(taskId, {
            progress: '正在转换音频'
        });
        try {
            const files = await this.convertAndSplit(taskId, filePath);
            this.dpTaskService.checkCancel(taskId);
            this.dpTaskService.process(taskId, {
                progress: '正在转录'
            });
            const whisperResponses = await Promise.all(files.map(async (file) => {
                return await this.whisperThreeTimes(taskId, file);
            }));
            const srtName = filePath.replace(path.extname(filePath), '.srt');
            console.log('srtName', srtName);
            fs.writeFileSync(srtName, toSrt(whisperResponses));
            this.dpTaskService.finish(taskId, {
                progress: '转录完成'
            });
        } catch (error) {
            const cancel = isErrorCancel(error);
            this.dpTaskService.update({
                id: taskId,
                status: cancel ? DpTaskState.CANCELLED : DpTaskState.FAILED,
                progress: cancel ? '任务取消' : error.message
            });
        }

    }


    private async whisperThreeTimes(taskId: number, chunk: SplitChunk): Promise<WhisperResponse> {
        let error: any = null;
        for (let i = 0; i < 3; i++) {
            try {
                return await this.whisper(taskId, chunk);
            } catch (e) {
                error = e;
            }
            this.dpTaskService.checkCancel(taskId);
        }
        throw error;
    }

    private async whisper(taskId: number, chunk: SplitChunk): Promise<WhisperResponse> {
        await RateLimiter.wait('whisper');
        const data = new FormData();
        data.append('file', fs.createReadStream(chunk.filePath) as any);
        data.append('model', 'whisper-1');
        data.append('language', 'en');
        data.append('response_format', 'verbose_json');
        // 创建一个 CancelToken 的实例
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        const config = {
            method: 'post',
            url: UrlUtil.joinWebUrl(storeGet('apiKeys.openAi.endpoint'), '/v1/audio/transcriptions'),
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${storeGet('apiKeys.openAi.key')}`,
                'Content-Type': 'multipart/form-data',
                ...data.getHeaders()
            },
            data: data,
            timeout: 1000 * 60 * 10,
            cancelToken: source.token
        };

        this.childProcessService.registerCancelTokenSource(taskId, [source]);

        const response = await axios(config)
            .catch((error) => {
                if (axios.isCancel(error)) {
                    throw new Error(ErrorConstants.CANCEL_MSG);
                }
                throw error;
            });
        return {
            ...response.data,
            offset: chunk.offset
        };
    }

    async convertAndSplit(taskId: number, filePath: string): Promise<SplitChunk[]> {
        const folderName = hash(filePath);
        const tempDir = path.join(os.tmpdir(), 'dp/whisper/', folderName);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        // 删除该目录下的所有文件
        fs.readdirSync(tempDir).forEach((file) => {
            fs.unlinkSync(path.join(tempDir, file));
        });
        const files = await this.ffmpegService.splitToAudio({
            taskId,
            inputFile: filePath,
            outputFolder: tempDir,
            segmentTime: 60 * 5
        });
        const chunks: SplitChunk[] = [];
        let offset = 0;
        for (const file of files) {
            const duration = await this.ffmpegService.duration(file);
            chunks.push({
                offset,
                filePath: file
            });
            offset += duration;
        }
        return chunks;
    }
}


export default WhisperServiceImpl;
