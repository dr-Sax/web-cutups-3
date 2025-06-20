// Modify the initFileRegistry function to include collapsible menus
export function initFileRegistry() {
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileRegistry';
    fileInput.style.display = 'none';
    fileInput.multiple = true;
    fileInput.accept = 'image/*,video/*,text/html';
    document.body.appendChild(fileInput);
    
    // Create a container for all UI elements with a minimize button
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '10px';
    uiContainer.style.left = '10px';
    uiContainer.style.zIndex = '1000';
    uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    uiContainer.style.borderRadius = '5px';
    uiContainer.style.padding = '10px';
    uiContainer.style.color = 'white';
    uiContainer.style.maxWidth = '300px';
    document.body.appendChild(uiContainer);
    
    // Create header with title and collapse button
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.marginBottom = '10px';
    uiContainer.appendChild(headerDiv);
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = 'File Registry';
    titleSpan.style.fontWeight = 'bold';
    headerDiv.appendChild(titleSpan);
    
    const collapseButton = document.createElement('button');
    collapseButton.textContent = '−';
    collapseButton.style.background = 'none';
    collapseButton.style.border = '1px solid white';
    collapseButton.style.color = 'white';
    collapseButton.style.width = '20px';
    collapseButton.style.height = '20px';
    collapseButton.style.borderRadius = '3px';
    collapseButton.style.cursor = 'pointer';
    collapseButton.style.display = 'flex';
    collapseButton.style.justifyContent = 'center';
    collapseButton.style.alignItems = 'center';
    headerDiv.appendChild(collapseButton);
    
    // Create content container that can be collapsed
    const contentContainer = document.createElement('div');
    contentContainer.id = 'fileRegistryContent';
    uiContainer.appendChild(contentContainer);
    
    // Create a registry button
    const registryButton = document.createElement('button');
    registryButton.textContent = 'Register Local Files';
    registryButton.style.marginBottom = '10px';
    registryButton.style.padding = '5px 10px';
    registryButton.style.borderRadius = '3px';
    registryButton.style.border = 'none';
    registryButton.style.backgroundColor = '#4CAF50';
    registryButton.style.color = 'white';
    registryButton.style.cursor = 'pointer';
    registryButton.onclick = () => fileInput.click();
    contentContainer.appendChild(registryButton);
    
    // Create a collapsible help text
    const helpHeader = document.createElement('div');
    helpHeader.style.display = 'flex';
    helpHeader.style.justifyContent = 'space-between';
    helpHeader.style.alignItems = 'center';
    helpHeader.style.marginTop = '10px';
    helpHeader.style.marginBottom = '5px';
    helpHeader.style.cursor = 'pointer';
    contentContainer.appendChild(helpHeader);
    
    const helpTitleSpan = document.createElement('span');
    helpTitleSpan.textContent = 'Instructions';
    helpTitleSpan.style.fontWeight = 'bold';
    helpHeader.appendChild(helpTitleSpan);
    
    const helpCollapseButton = document.createElement('button');
    helpCollapseButton.textContent = '−';
    helpCollapseButton.style.background = 'none';
    helpCollapseButton.style.border = '1px solid white';
    helpCollapseButton.style.color = 'white';
    helpCollapseButton.style.width = '20px';
    helpCollapseButton.style.height = '20px';
    helpCollapseButton.style.borderRadius = '3px';
    helpCollapseButton.style.cursor = 'pointer';
    helpCollapseButton.style.display = 'flex';
    helpCollapseButton.style.justifyContent = 'center';
    helpCollapseButton.style.alignItems = 'center';
    helpHeader.appendChild(helpCollapseButton);
    
    const helpText = document.createElement('div');
    helpText.id = 'helpTextContent';
    helpText.style.padding = '5px';
    helpText.style.borderRadius = '3px';
    helpText.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    helpText.innerHTML = '1. Click "Register Local Files" to select files<br>2. Files will be assigned IDs<br>3. Use "localfile://ID" in your JSON for the src field';
    contentContainer.appendChild(helpText);
    
    // File list section (will be populated when files are added)
    const fileListHeader = document.createElement('div');
    fileListHeader.style.display = 'flex';
    fileListHeader.style.justifyContent = 'space-between';
    fileListHeader.style.alignItems = 'center';
    fileListHeader.style.marginTop = '10px';
    fileListHeader.style.marginBottom = '5px';
    fileListHeader.style.cursor = 'pointer';
    contentContainer.appendChild(fileListHeader);
    
    const fileListTitleSpan = document.createElement('span');
    fileListTitleSpan.textContent = 'Registered Files';
    fileListTitleSpan.style.fontWeight = 'bold';
    fileListHeader.appendChild(fileListTitleSpan);
    
    const fileListCollapseButton = document.createElement('button');
    fileListCollapseButton.textContent = '−';
    fileListCollapseButton.style.background = 'none';
    fileListCollapseButton.style.border = '1px solid white';
    fileListCollapseButton.style.color = 'white';
    fileListCollapseButton.style.width = '20px';
    fileListCollapseButton.style.height = '20px';
    fileListCollapseButton.style.borderRadius = '3px';
    fileListCollapseButton.style.cursor = 'pointer';
    fileListCollapseButton.style.display = 'flex';
    fileListCollapseButton.style.justifyContent = 'center';
    fileListCollapseButton.style.alignItems = 'center';
    fileListHeader.appendChild(fileListCollapseButton);
    
    const fileListContainer = document.createElement('div');
    fileListContainer.id = 'fileListContainer';
    fileListContainer.style.maxHeight = '150px';
    fileListContainer.style.overflow = 'auto';
    fileListContainer.style.padding = '5px';
    fileListContainer.style.borderRadius = '3px';
    fileListContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    fileListContainer.innerHTML = '<em>No files registered yet</em>';
    contentContainer.appendChild(fileListContainer);
    
    // Add event listeners for collapsing/expanding
    collapseButton.addEventListener('click', () => {
        if (contentContainer.style.display === 'none') {
            contentContainer.style.display = 'block';
            collapseButton.textContent = '−';
        } else {
            contentContainer.style.display = 'none';
            collapseButton.textContent = '+';
        }
    });
    
    helpHeader.addEventListener('click', () => {
        if (helpText.style.display === 'none') {
            helpText.style.display = 'block';
            helpCollapseButton.textContent = '−';
        } else {
            helpText.style.display = 'none';
            helpCollapseButton.textContent = '+';
        }
    });
    
    fileListHeader.addEventListener('click', () => {
        if (fileListContainer.style.display === 'none') {
            fileListContainer.style.display = 'block';
            fileListCollapseButton.textContent = '−';
        } else {
            fileListContainer.style.display = 'none';
            fileListCollapseButton.textContent = '+';
        }
    });
    
    // Create global file registry
    window.fileRegistry = {
        files: {},
        nextId: 0,
        registerFile: function(file) {
            const id = this.nextId++;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.files[id] = {
                    name: file.name,
                    type: file.type,
                    dataUrl: e.target.result
                };
                console.log(`Registered file: ${file.name} with ID: ${id}`);
                updateFileList(); // Update the file list display
            };
            reader.readAsDataURL(file);
            return id;
        },
        getFile: function(id) {
            return this.files[id] || null;
        },
        listFiles: function() {
            const fileList = [];
            for (const id in this.files) {
                fileList.push({
                    id: id,
                    name: this.files[id].name,
                    type: this.files[id].type
                });
            }
            return fileList;
        }
    };
    
    // Function to update the file list display
    function updateFileList() {
        const files = window.fileRegistry.listFiles();
        
        if (files.length === 0) {
            fileListContainer.innerHTML = '<em>No files registered yet</em>';
            return;
        }
        
        fileListContainer.innerHTML = '';
        
        for (const file of files) {
            const fileItem = document.createElement('div');
            fileItem.style.marginBottom = '5px';
            fileItem.style.wordBreak = 'break-all';
            fileItem.innerHTML = `ID: <strong>${file.id}</strong> - ${file.name}`;
            fileListContainer.appendChild(fileItem);
        }
    }
    
    // Listen for file selection
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (!files.length) return;
        
        for (let i = 0; i < files.length; i++) {
            window.fileRegistry.registerFile(files[i]);
        }
    });
    
    console.log('File registry initialized with collapsible menus');
}