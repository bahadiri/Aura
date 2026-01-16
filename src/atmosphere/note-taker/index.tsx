import { NoteTakerManifest } from './manifest';
import { resources } from './resources';
import NoteTakerUI from './ui';
import { useNoteTakerLogic } from './logic';
import React from 'react';

// The Module Component
const NoteTakerAIR: React.FC<any> = (props) => {
    const logic = useNoteTakerLogic(props);

    // Ensure we pass all required props to UI, including handlers from logic
    return (
        <NoteTakerUI 
            value= { logic.value }
    setValue = { logic.setValue }
    title = { logic.title }
    isPolishing = { logic.isPolishing }
    isGeneratingTitle = { logic.isGeneratingTitle }
    onPolish = { logic.polishNotes }
    onDownload = { logic.downloadNotes }
    placeholder = { props.placeholder }
        />
    );
};

export default {
    manifest: NoteTakerManifest,
    resources,
    component: NoteTakerAIR
};

export { NoteTakerAIR as Component };
