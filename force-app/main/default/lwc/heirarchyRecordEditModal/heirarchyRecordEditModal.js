import { LightningElement, api } from 'lwc';
import NAME_FIELD from '@salesforce/schema/Heirarchy__c.Name';
import ROLE_FIELD from '@salesforce/schema/Heirarchy__c.Role__c';
import IMAGE_FIELD from '@salesforce/schema/Heirarchy__c.image__c';
import PARENT_FIELD from '@salesforce/schema/Heirarchy__c.Parent__c';
import initialize from '@salesforce/apex/HeirarchyController.initialize';

export default class heirarchyRecordEditModal extends LightningElement {
    @api isHeirarchyRecordModalOpen;
    @api heirarchyModalMode;
    @api recordId;
    @api recordData;
    fields = [NAME_FIELD, ROLE_FIELD, IMAGE_FIELD, PARENT_FIELD];

    connectedCallback() {
        this.isHeirarchyRecordModalOpen = false;
    }
    createNewHeirarchyRecord() {
        this.isHeirarchyRecordModalOpen = true;
        this.recordData = {};
        this.recordId = '';
        this.heirarchyModalMode = 'edit';
    }
    prePopulateValues(event) {
        // event.detail.fields
    }
    hideHeirarchyModal() {
        this.isHeirarchyRecordModalOpen = false;
        this.dispatchResult({}, 'cancel');
    }
    handlesubmit(event) {
        event.preventDefault();
        console.log(JSON.stringify(event.detail));
        this.template.querySelector('lightning-record-edit-form').submit(event.detail.fields);
    }
    handleSuccess() {
        initialize()
        .then(response => {
            this.isHeirarchyRecordModalOpen = false;
            this.recordData = {};
            this.dispatchResult(response, 'upsert');
        })
        .catch()
    }
    dispatchResult(resultData, type) {
        const selectedEvent = new CustomEvent("modalevent", {
            detail: {
                type: type,
                data: resultData
            }
        });
        this.dispatchEvent(selectedEvent);
    }
}