import { Page as pptrPage, Frame as pptrFrame } from 'puppeteer';
import { ElementHandle as pptrCoreElementHandle, Page as pptrCorePage, Frame as pptrCoreFrame } from 'puppeteer-core';

export { pptrPage, pptrCorePage};

export type ElementHandle = pptrCoreElementHandle;
export type Page = pptrCorePage | pptrPage;
export type Frame = pptrCoreFrame | pptrFrame;
