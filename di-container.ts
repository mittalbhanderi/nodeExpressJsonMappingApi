import { Container } from 'inversify';
import MainService from './services'
import HelperService from './services/helperService'
import MapperService from './services/mapperService'

var DIContainer = new Container();
DIContainer.bind<MainService>(MainService).toSelf();
DIContainer.bind<HelperService>(HelperService).toSelf();
DIContainer.bind<MapperService>(MapperService).toSelf();

export default DIContainer;