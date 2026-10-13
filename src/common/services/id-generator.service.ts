import { Injectable } from '@nestjs/common';
import { IdGenerator } from '../abstracts/id-generator.abstract.js';
import { randomUUID } from 'crypto';

@Injectable()
export class IdGeneratorService implements IdGenerator{

    generate32CaracterId(): string {
        const id = randomUUID().replace(/-/g, '');
        return id;
    }

}
