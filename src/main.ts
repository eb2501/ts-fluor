// Vite entry for TypeScript support
import { UIApp } from './ui/ui_app';
import { para } from './ui/ui_para';

new UIApp("#app", para("Hello from UIPara!", "base"))
