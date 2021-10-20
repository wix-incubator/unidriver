import { ElementHandle as pptrElementHandle, Page as pptrPage, Frame as pptrFrame } from 'puppeteer';
import { ElementHandle as pptrCoreElementHandle, Page as pptrCorePage, Frame as pptrCoreFrame, KeyInput } from 'puppeteer-core';

export { pptrPage, pptrCorePage, KeyInput};

export type ElementHandle = pptrCoreElementHandle | pptrElementHandle;
export type Page = pptrCorePage | pptrPage;
export type Frame = pptrCoreFrame | pptrFrame;
