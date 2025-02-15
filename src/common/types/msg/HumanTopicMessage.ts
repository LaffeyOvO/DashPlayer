import CustomMessage, { MsgType } from '@/common/types/msg/interfaces/CustomMessage';
import { Topic } from '@/fronted/hooks/useChatPanel';
import { CoreMessage } from 'ai';


class HumanTopicMessage implements CustomMessage<HumanTopicMessage> {
    private readonly topic: Topic;
    public content: string;
    public phraseGroupTask: number;

    constructor(topic: Topic, text: string, phraseGroupTask: number) {
        this.topic = topic;
        this.content = text;
        this.phraseGroupTask = phraseGroupTask;
    }

    async toMsg(): Promise<CoreMessage[]> {
        return [
            {
                role: 'system',
                content: 'You are an English teacher, specialized in teaching English.'
            },
            {
                role: 'user',
                content: `请帮我分析 "${this.content}"`
            }];
    }

    msgType: MsgType = 'human-topic';

    copy(): HumanTopicMessage {
        return new HumanTopicMessage(this.topic, this.content, this.phraseGroupTask);
    }

    getTopic(): Topic {
        return this.topic;
    }

    getTaskIds(): number[] {
        return [this.phraseGroupTask];
    }
}

export default HumanTopicMessage;
