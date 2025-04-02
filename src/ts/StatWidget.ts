import { isWhitespace } from "./util";

export default class StatWidget {
    container: HTMLElement;
    summaryEl: HTMLElement;
    detailsEl: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;

        const percentageEl = container.querySelector('.summary') as HTMLElement;
        const absoluteValuesEl = container.querySelector('.details') as HTMLElement;

        if (!percentageEl || !absoluteValuesEl) {
            throw new Error('Required elements not found inside the container.');
        }

        this.summaryEl = percentageEl;
        this.detailsEl = absoluteValuesEl;

        // Adjust the absolute values width on initialization and on resize.
        this.adjustAbsoluteValuesWidth();
        window.addEventListener('resize', () => this.adjustAbsoluteValuesWidth());
    }

    adjustAbsoluteValuesWidth() {
        // Match the width of the percentage element to ensure the bottom text does not exceed it.
        const width = this.summaryEl.clientWidth;
        this.detailsEl.style.width = width + 'px';
    }

    setPercentage(partial: number, total: number) {
        this.summaryEl.textContent = `${(partial / total * 100).toPrecision(2)}%`;
        this.detailsEl.textContent = `${partial}/${total}`;
        this.adjustAbsoluteValuesWidth();
    }

    setMinMaxAvg(values: number[]) {
        const sum = values.reduce((a, b) => a + b);
        this.summaryEl.textContent = (sum / values.length).toPrecision(2);
        this.detailsEl.textContent = `${Math.min(...values)}..${Math.max(...values)}`;
        this.adjustAbsoluteValuesWidth();
    }

    setModeByChar(values: string[]) {
        const frequencyMap: Record<string, number> = {};

        // Count characters
        for (const str of values) {
            for (const char of str) {
                if (!isWhitespace(char)) frequencyMap[char] = (frequencyMap[char] || 0) + 1;
            }
        }

        // Find the character with the highest count
        let maxChar: string | null = null;
        let maxCount = 0;

        for (const [char, count] of Object.entries(frequencyMap)) {
            if (count > maxCount) {
                maxCount = count;
                maxChar = char;
            }
        }

        this.summaryEl.textContent = maxChar;
        this.detailsEl.textContent = `${maxCount} fois`;
        this.adjustAbsoluteValuesWidth();
    }
}

