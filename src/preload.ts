// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {contextBridge, ipcRenderer, IpcRendererEvent} from 'electron';
import {WatchProjectVideo} from '@/backend/db/tables/watchProjectVideos';
import {WatchProjectVO} from '@/backend/services/WatchProjectService';
import {SentenceStruct} from './common/types/SentenceStruct';
import {SettingKey} from './common/types/store_schema';
import {WindowState} from './common/types/Types';
import {YdRes} from './common/types/YdRes';
import Release from '@/common/types/release';
import {
    InsertSubtitleTimestampAdjustment,
    SubtitleTimestampAdjustment
} from '@/backend/db/tables/subtitleTimestampAdjustment';
import {DpTask} from '@/backend/db/tables/dpTask';
import {BaseMessage} from '@langchain/core/messages';
import {toMsgMiddle} from '@/common/types/ChatMessage';
import {AnalyzeSentenceParams} from '@/common/types/AnalyzeSentenceParams';

export type Channels =
    | 'main-state'
    | 'setting-state'
    | 'ipc-example'
    | 'update-progress'
    | 'trans-word'
    | 'query-progress'
    | 'batch-translate'
    | 'show-button'
    | 'hide-button'
    | 'is-windows'
    | 'open-menu'
    | 'you-dao-translate'
    | 'get-audio'
    | 'open-data-dir'
    | 'query-cache-size'
    | 'clear-cache'
    | 'open-url'
    | 'check-update'
    | 'app-version'
    | 'player-size'
    | 'home-size'
    | 'recent-watch'
    | 'reload-recent-from-disk'
    | 'open-file'
    | 'words-translate'
    | 'list-words-view'
    | 'batch-update-level-words'
    | 'mark-word-level'
    | 'write-to-clipboard'
    | 'read-from-clipboard'
    | 'process-sentences'
    | 'get-video'
    | 'store-set'
    | 'store-get'
    | 'store-update'
    | 'select-file'
    | 'subtitle-timestamp-record'
    | 'subtitle-timestamp-delete-key'
    | 'subtitle-timestamp-delete-path'
    | 'subtitle-timestamp-get-key'
    | 'subtitle-timestamp-get-path'
    | 'transcript'
    | 'dp-task-detail'
    | 'dp-task-cancel'
    | 'ai-chat'
    | 'ai-analyze-current'
    | 'ai-analyze-new-words'
    | 'ai-analyze-new-phrases'
    | 'ai-analyze-grammers'
    | 'ai-make-example-sentences'
    | 'ai-synonymous-sentence';

const invoke = (channel: Channels, ...args: unknown[]) => {
    return ipcRenderer.invoke(channel, ...args);
};

const on = (channel: Channels, func: (...args: unknown[]) => void) => {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
        ipcRenderer.removeListener(channel, subscription);
    };
};
const electronHandler = {
    subtitleTimestampRecord: async (
        e: InsertSubtitleTimestampAdjustment
    ): Promise<void> => {
        await invoke('subtitle-timestamp-record', e);
    },
    subtitleTimestampDeleteByKey: async (key: string): Promise<void> => {
        await invoke('subtitle-timestamp-delete-key', key);
    },
    subtitleTimestampDeleteByPath: async (
        subtitlePath: string
    ): Promise<void> => {
        await invoke('subtitle-timestamp-delete-path', subtitlePath);
    },
    subtitleTimestampGetByKey: async (
        key: string
    ): Promise<SubtitleTimestampAdjustment | undefined> => {
        return (await invoke('subtitle-timestamp-get-key', key)) as
            | SubtitleTimestampAdjustment
            | undefined;
    },
    subtitleTimestampGetByPath: async (
        subtitlePath: string
    ): Promise<SubtitleTimestampAdjustment[]> => {
        return (await invoke(
            'subtitle-timestamp-get-path',
            subtitlePath
        )) as SubtitleTimestampAdjustment[];
    },
    storeSet: async (key: SettingKey, value: string | null | undefined) => {
        await invoke('store-set', key, value);
    },
    storeGet: async (key: SettingKey) => {
        return (await invoke('store-get', key)) as string;
    },
    setMainState: async (state: WindowState) => {
        await invoke('main-state', state);
    },
    setSettingState: async (state: WindowState) => {
        await invoke('setting-state', state);
    },
    transWord: async (word: string) => {
        return (await invoke('you-dao-translate', word)) as YdRes;
    },
    fetchAudio: async (url: string) => {
        const data = (await invoke('get-audio', url)) as never;
        const blob = new Blob([data], {type: 'audio/mpeg'});
        return URL.createObjectURL(blob);
    },
    queryCacheSize: async () => {
        return (await invoke('query-cache-size')) as string;
    },
    openDataFolder: async () => {
        await invoke('open-data-dir');
    },
    clearCache: async () => {
        await invoke('clear-cache');
    },
    openMenu: async () => {
        await invoke('open-menu');
    },
    playerSize: async () => {
        await invoke('player-size');
    },
    homeSize: async () => {
        await invoke('home-size');
    },
    showButton: async () => {
        await invoke('show-button');
    },
    hideButton: async () => {
        await invoke('hide-button');
    },
    batchTranslate: async (
        sentences: string[]
    ): Promise<Map<string, string>> => {
        const mapping = (await invoke('batch-translate', sentences)) as Map<
            string,
            string
        >;
        return mapping;
    },
    updateProgress: async (progress: WatchProjectVideo) => {
        await invoke('update-progress', progress);
    },
    queryProgress: async (videoId: number) => {
        return (await invoke('query-progress', videoId)) as WatchProjectVideo;
    },
    checkUpdate: async () => {
        return (await invoke('check-update')) as Release[];
    },
    markWordLevel: async (word: string, familiar: boolean) => {
        return (await invoke('mark-word-level', word, familiar)) as void;
    },
    dpTaskDetail: async (id: number) => {
        return (await invoke('dp-task-detail', id)) as DpTask;
    },
    dpTaskCancel: async (id: number) => {
        await invoke('dp-task-cancel', id);
    },
    chat: async (msgs: BaseMessage[]) => {
        const msgMiddle = msgs.map((msg) => toMsgMiddle(msg));
        return (await invoke('ai-chat', msgMiddle)) as number;
    },
    aiAnalyzeCurrent: async (params: AnalyzeSentenceParams) => {
        return (await invoke('ai-analyze-current', params)) as number;
    },
    aiAnalyzeNewWords: async (sentence: string) => {
        return (await invoke('ai-analyze-new-words', sentence)) as number;
    },
    aiAnalyzeNewPhrases: async (sentence: string) => {
        return (await invoke('ai-analyze-new-phrases', sentence)) as number;
    },
    aiAnalyzeGrammers: async (sentence: string) => {
        return (await invoke('ai-analyze-grammers', sentence)) as number;
    },
    aiMakeExampleSentences: async (sentence: string, points: string[]) => {
        return (await invoke('ai-make-example-sentences', sentence, points)) as number;
    },
    aiSynonymousSentence: async (sentence: string) => {
        return (await invoke('ai-synonymous-sentence', sentence)) as number;
    },
    appVersion: async () => {
        return (await invoke('app-version')) as string;
    },
    openUrl: async (url: string) => {
        await invoke('open-url', url);
    },
    openFile: async (path: string) => {
        const data = await invoke('open-file', path);
        if (data === null) return null;
        const blob = new Blob([data]);
        return URL.createObjectURL(blob);
    },
    writeToClipboard: async (text: string) => {
        await invoke('write-to-clipboard', text);
    },
    readFromClipboard: async () => {
        return (await invoke('read-from-clipboard')) as string;
    },
    recentWatch: async () => {
        return (await invoke('recent-watch')) as WatchProjectVO[];
    },
    reloadRecentFromDisk: async () => {
        return (await invoke('reload-recent-from-disk')) as WatchProjectVO[];
    },
    isWindows: async () => {
        return (await invoke('is-windows')) as boolean;
    },
    selectFile: async (isFolder: boolean) => {
        return (await invoke('select-file', isFolder)) as
            | WatchProjectVO
            | undefined
            | string;
    },
    getVideo: async (videoId: number) => {
        return (await invoke('get-video', videoId)) as
            | WatchProjectVideo
            | undefined;
    },
    processSentences: async (sentences: string[]) => {
        return (await invoke(
            'process-sentences',
            sentences
        )) as SentenceStruct[];
    },
    transcript: async (filePath: string) => {
        return await invoke('transcript', filePath) as number;
    },
    onStoreUpdate: (func: (key: SettingKey, value: string) => void) => {
        console.log('onStoreUpdate');
        return on('store-update', func as never);
    },
    onMainState: (func: (state: WindowState) => void) => {
        return on('main-state', func as never);
    },
    onSettingState: (func: (state: WindowState) => void) => {
        return on('setting-state', func as never);
    }
};
contextBridge.exposeInMainWorld('electron', electronHandler);
export type ElectronHandler = typeof electronHandler;
