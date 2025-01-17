import { SR5 } from "../config.js";

export default class SR5MeasuredTemplateConfig extends MeasuredTemplateConfig {
    constructor(...args) {
        super(...args);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        return foundry.utils.mergeObject(super.defaultOptions, {
            tabs: [
				{
					navSelector: ".tabs",
					contentSelector: "form",
					initial: "basic",
				},
			],
            lists: SR5,
        });
    }

    getData(options={}) {
        const context = super.getData(options);
        context.data.flags.sr5.lists = SR5
        return context
    }
    
    get template() {
        return `systems/sr5/templates/interface/srTemplateConfig.html`;
    }

    updateMatrixNoise(html) {
        let matrixNoise = (parseInt(this.document.flags.sr5?.matrixSpam) || 0) + (parseInt(this.document.flags.sr5?.matrixStatic) || 0);
        html.find('[name="sceneNoiseRating"]')[0].value = matrixNoise;
        this.document.setFlag("sr5", "matrixNoise", matrixNoise);
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.updateMatrixNoise(html);

        html.find('[name="matrixSpam"]').change(ev => {
            let value = (parseInt(ev.target.value) || 0);
            this.document.setFlag("sr5", "matrixSpam", value);
            this.updateMatrixNoise(html);
        });

        html.find('[name="matrixStatic"]').change(ev => {
            let value = (parseInt(ev.target.value) || 0);
            this.document.setFlag("sr5", "matrixStatic", value);
            this.updateMatrixNoise(html);
        });
    }
}