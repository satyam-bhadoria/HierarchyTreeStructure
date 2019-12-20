import { LightningElement, api } from 'lwc';

export default class heirarchyCard extends LightningElement {
    @api heirarchyData;

    editRecord() {
        const selectedEvent = new CustomEvent("editheirarchyrecord", {
            detail: this.heirarchyData.Id
        });
        this.dispatchEvent(selectedEvent);
    }
    newRecord() {
        const selectedEvent = new CustomEvent("createheirarchyrecord", {
            detail: this.heirarchyData.Id
        });
        this.dispatchEvent(selectedEvent);
    }
    deleteRecord() {
        const selectedEvent = new CustomEvent("deleteheirarchyrecord", {
            detail: this.heirarchyData.Id
        });
        this.dispatchEvent(selectedEvent);
    }
}