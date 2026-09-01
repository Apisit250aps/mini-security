import { created, response, success, validator } from '../lib/response';

export abstract class Controller {
  protected readonly validator = validator;
  protected readonly response = response;
  protected readonly created = created;
  protected readonly success = success;
}

export default Controller;
