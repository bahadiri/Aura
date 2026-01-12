export interface ImageAIRProps {
    src: string;
    alt?: string;
    title?: string;
    language?: string;
    prompt?: string;
}

export const useImageAIR = (props: ImageAIRProps) => {
    // Currently no complex logic, but prepared for future (e.g., zoom, pan)
    return {
        ...props,
        displayTitle: props.title
    };
};
