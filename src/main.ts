// Vite entry for TypeScript support
import { UIApp } from './ui/ui_app';
import { para } from './ui/ui_para';

const fontSizes = ["15px", "18px", "21px", "23px", "25px"];
const p = para("Hello from UIPara!", fontSizes[0]);
new UIApp("#app", p);

let counter = 0;
setInterval(() => {
    if (counter == 1000) {
        return;
    }
    const idx = (counter++) % fontSizes.length;
    p.model()!.size.set(fontSizes[idx]);
}, 1);

