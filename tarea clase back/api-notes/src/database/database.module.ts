import { Module } from '@nestjs/common';
import { JsonDb } from './json-db.js';

@Module({
  providers: [JsonDb],
  exports: [JsonDb],
})
export class DatabaseModule { }
