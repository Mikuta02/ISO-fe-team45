import * as process from 'process';
import { Buffer } from 'buffer';

(window as any).process = process;
(window as any).Buffer = Buffer;


(window as any).global = window;
