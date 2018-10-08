// Mermaid is loaded explicitly from the index.html file (uses webpack)
if (!window.mermaid) {
    throw new Error('mermaid not found');
}
window.mermaid.initialize({ startOnLoad: false });
