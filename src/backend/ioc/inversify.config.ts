import { Container } from 'inversify';
import TYPES from './types';
import FavoriteClipsController from '@/backend/controllers/FavoriteClipsController';
import Controller from '@/backend/interfaces/controller';
import DownloadVideoController from '@/backend/controllers/DownloadVideoController';
import TagService from '@/backend/services/TagService';
import TagController from '@/backend/controllers/TagController';
import SrtTimeAdjustService from '@/backend/services/SrtTimeAdjustService';
import { SubtitleServiceImpl } from '@/backend/services/impl/SubtitleServiceImpl';
import SubtitleService from '@/backend/services/SubtitleService';
import SrtTimeAdjustServiceImpl from '@/backend/services/impl/SrtTimeAdjustServiceImpl';
import SrtTimeAdjustController from '@/backend/controllers/SrtTimeAdjustController';
import AiFuncController from '@/backend/controllers/AiFuncController';
import AiTransController from '@/backend/controllers/AiTransController';
import ConvertController from '@/backend/controllers/ConvertController';
import DpTaskController from '@/backend/controllers/DpTaskController';
import MediaController from '@/backend/controllers/MediaController';
import StorageController from '@/backend/controllers/StorageController';
import SystemController from '@/backend/controllers/SystemController';
import SubtitleController from '@/backend/controllers/SubtitleController';
import SystemServiceImpl from '@/backend/services/impl/SystemServiceImpl';
import SystemService from '@/backend/services/SystemService';
import { CacheServiceImpl } from '@/backend/services/impl/CacheService';
import SettingService from '@/backend/services/SettingService';
import SettingServiceImpl from '@/backend/services/impl/SettingServiceImpl';
import { FavouriteClipsService } from '@/backend/services/FavouriteClipsService';
import FavouriteClipsServiceImpl from '@/backend/services/impl/FavouriteClipsServiceImpl';
import CacheService from '@/backend/services/CacheService';
import { ClipOssService } from '@/backend/services/OssService';
import ClipOssServiceImpl from '@/backend/services/impl/ClipOssServiceImpl';
import LocationServiceImpl from '@/backend/services/impl/LocationServiceImpl';
import LocationService from '@/backend/services/LocationService';
import FfmpegService from '@/backend/services/FfmpegService';
import FfmpegServiceImpl from '@/backend/services/impl/FfmpegServiceImpl';
import DpTaskService from '@/backend/services/DpTaskService';
import DpTaskServiceImpl from '@/backend/services/impl/DpTaskServiceImpl';
import ChatService from '@/backend/services/ChatService';
import ChatServiceImpl from '@/backend/services/impl/ChatServiceImpl';
import AiProviderServiceImpl from '@/backend/services/impl/clients/AiProviderServiceImpl';
import AiServiceImpl, { AiService } from '@/backend/services/AiServiceImpl';
import WhisperService from '@/backend/services/WhisperService';
import WhisperServiceImpl from '@/backend/services/impl/WhisperServiceImpl';
import ConvertService from '@/backend/services/ConvertService';
import ConvertServiceImpl from '@/backend/services/impl/ConvertServiceImpl';
import SplitVideoService from '@/backend/services/SplitVideoService';
import SplitVideoServiceImpl from '@/backend/services/impl/SplitVideoServiceImpl';
import MediaService from '@/backend/services/MediaService';
import MediaServiceImpl from '@/backend/services/impl/MediaServiceImpl';
import ClientProviderService from '@/backend/services/ClientProviderService';
import YouDaoProvider from '@/backend/services/impl/clients/YouDaoProvider';
import TencentProvider from '@/backend/services/impl/clients/TencentProvider';
import { ChatOpenAI } from '@langchain/openai';
import TranslateServiceImpl from '@/backend/services/impl/TranslateServiceImpl';
import TranslateService from '@/backend/services/AiTransServiceImpl';
import TagServiceImpl from '@/backend/services/impl/TagServiceImpl';
import YouDaoClient from '@/backend/objs/YouDaoClient';
import TencentClient from '@/backend/objs/TencentClient';
import DlVideoService from '@/backend/services/DlVideoService';
import DlVideoServiceImpl from '@/backend/services/impl/DlVideoServiceImpl';
import WatchHistoryService from '@/backend/services/WatchHistoryService';
import WatchHistoryServiceImpl from '@/backend/services/impl/WatchHistoryServiceImpl';
import WatchHistoryController from '@/backend/controllers/WatchHistoryController';


const container = new Container();
// Clients
container.bind<ClientProviderService<YouDaoClient>>(TYPES.YouDaoClientProvider).to(YouDaoProvider).inSingletonScope();
container.bind<ClientProviderService<TencentClient>>(TYPES.TencentClientProvider).to(TencentProvider).inSingletonScope();
container.bind<ClientProviderService<ChatOpenAI>>(TYPES.OpenAiClientProvider).to(AiProviderServiceImpl).inSingletonScope();
// Controllers
container.bind<Controller>(TYPES.Controller).to(FavoriteClipsController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(DownloadVideoController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(TagController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(SrtTimeAdjustController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(AiFuncController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(AiTransController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(ConvertController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(DpTaskController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(MediaController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(StorageController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(SystemController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(SubtitleController).inSingletonScope();
container.bind<Controller>(TYPES.Controller).to(WatchHistoryController).inSingletonScope();
// Services
container.bind<ClipOssService>(TYPES.ClipOssService).to(ClipOssServiceImpl).inSingletonScope();
container.bind<FavouriteClipsService>(TYPES.FavouriteClips).to(FavouriteClipsServiceImpl).inSingletonScope();
container.bind<DlVideoService>(TYPES.DlVideo).to(DlVideoServiceImpl).inSingletonScope();
container.bind<TagService>(TYPES.TagService).to(TagServiceImpl).inSingletonScope();
container.bind<SrtTimeAdjustService>(TYPES.SrtTimeAdjustService).to(SrtTimeAdjustServiceImpl).inSingletonScope();
container.bind<SubtitleService>(TYPES.SubtitleService).to(SubtitleServiceImpl).inSingletonScope();
container.bind<SystemService>(TYPES.SystemService).to(SystemServiceImpl).inSingletonScope();
container.bind<CacheService>(TYPES.CacheService).to(CacheServiceImpl).inSingletonScope();
container.bind<SettingService>(TYPES.SettingService).to(SettingServiceImpl).inSingletonScope();
container.bind<LocationService>(TYPES.LocationService).to(LocationServiceImpl).inSingletonScope();
container.bind<FfmpegService>(TYPES.FfmpegService).to(FfmpegServiceImpl).inSingletonScope();
container.bind<DpTaskService>(TYPES.DpTaskService).to(DpTaskServiceImpl).inSingletonScope();
container.bind<ChatService>(TYPES.ChatService).to(ChatServiceImpl).inSingletonScope();
container.bind<AiService>(TYPES.AiService).to(AiServiceImpl).inSingletonScope();
container.bind<WhisperService>(TYPES.WhisperService).to(WhisperServiceImpl).inSingletonScope();
container.bind<ConvertService>(TYPES.ConvertService).to(ConvertServiceImpl).inSingletonScope();
container.bind<SplitVideoService>(TYPES.SplitVideoService).to(SplitVideoServiceImpl).inSingletonScope();
container.bind<MediaService>(TYPES.MediaService).to(MediaServiceImpl).inSingletonScope();
container.bind<TranslateService>(TYPES.TranslateService).to(TranslateServiceImpl).inSingletonScope();
container.bind<WatchHistoryService>(TYPES.WatchHistoryService).to(WatchHistoryServiceImpl).inSingletonScope();
export default container;
