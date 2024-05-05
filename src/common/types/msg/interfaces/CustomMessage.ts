import {BaseMessage} from "@langchain/core/messages";
import {MsgT} from "@/common/types/msg/interfaces/MsgT";
import { Topic } from '@/fronted/hooks/useChatPanel';

export default interface CustomMessage<T> {
    toMsg(): MsgT[];

    msgType: MsgType;

    copy(): T;

    getTopic(): Topic;
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
