import Controller from '@/backend/interfaces/controller';
import registerRoute from '@/common/api/register';
import { dialog } from 'electron';
import { ACCEPTED_FILE_TYPES } from '@/common/utils/MediaTypeUitl';
import path from 'path';

export default class SystemController implements Controller {
    public async isWindows() {
        return process.platform === 'win32';
    }

    public async selectFile({ mode }: {
        mode: 'file' | 'directory',
        filter: 'video' | 'srt' | 'none'
    }): Promise<string[]> {
        if (mode === 'file') {
            const files = await dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections'],
                filters: [
                    {
                        name: 'Movies',
                        extensions: ACCEPTED_FILE_TYPES.split(',').map((item) =>
                            item.substring(1)
                        )
                    }
                ]
            });
            return files.filePaths;
        }
        const files = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        return files.filePaths;
    }

    public async pathInfo(p: string): Promise<{
        baseName: string,
        dirName: string,
        extName: string,
    }> {
        return {
            baseName: path.basename(p),
            dirName: path.dirname(p),
            extName: path.extname(p)
        };
    }

    public registerRoutes(): void {
        registerRoute('system/is-windows', this.isWindows);
        registerRoute('system/select-file', this.selectFile);
        registerRoute('system/path-info', this.pathInfo);
    }
}
