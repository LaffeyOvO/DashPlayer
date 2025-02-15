import { Topic } from '@/fronted/hooks/useChatPanel';
import { CoreMessage } from 'ai';

export default interface CustomMessage<T> {
    toMsg(): Promise<CoreMessage[]>;

    msgType: MsgType;

    copy(): T;

    getTopic(): Topic;

    getTaskIds(): number[];
}

export type MsgType =
    | 'human-topic'
    | 'human-normal'
    | 'ai-welcome'
    | 'ai-streaming'
    | 'ai-normal'
    | 'ai-func-explain-select'
    | 'ai-func-explain-select-with-context'
    | 'ai-func-polish'
