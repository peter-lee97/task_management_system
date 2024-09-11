import { writable } from 'svelte/store';
import type { Account } from '../model';

export const accountStore = writable<Account | null>();
