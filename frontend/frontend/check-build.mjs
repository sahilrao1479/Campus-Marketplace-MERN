import { build } from 'vite';

try {
    await build();
    console.log('BUILD SUCCESS');
} catch (e) {
    
    const msg = e.message || String(e);
    // Print first 4000 chars
    console.log(msg.slice(0, 4000));
    if (e.frame) console.log('FRAME:', e.frame);
    if (e.id) console.log('ID:', e.id);
    if (e.stack) console.log('STACK:', String(e.stack).slice(0, 1000));
}
