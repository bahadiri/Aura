import { render } from '@testing-library/react';
import { View } from '../view';

describe('ImageAIR View', () => {
    it('renders image', () => {
        const { getByAltText } = render(
            <View src="test.jpg" alt="Test Image" />
        );
        expect(getByAltText('Test Image')).toBeInTheDocument();
    });

    it('renders title if provided', () => {
        const { getByText } = render(
            <View src="test.jpg" title="My Image" />
        );
        expect(getByText('My Image')).toBeInTheDocument();
    });
});
