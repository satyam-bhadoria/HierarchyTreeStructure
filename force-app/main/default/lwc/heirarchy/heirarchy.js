import { LightningElement, track, api } from 'lwc';

export default class heirarchy extends LightningElement {
    @track tempmainheirarchy;
    @track data = {};
    @track tempheirarchy;
    @api heirarchydata;
    @api get mainheirarchy() {
        return this.tempmainheirarchy;
    }
    set mainheirarchy(value) {
        this.setAttribute('mainheirarchy', value);
        this.tempmainheirarchy = value;
        this.tempheirarchy = [];
        if(value != null &&  value.value !== undefined && value.value != null) {
            for (let key in value.value) {
                if ({}.hasOwnProperty.call(value.value, key)) {
                    this.tempheirarchy.push({'key': key, 'value': value.value[key]});
                }
            }
        }
        for(let key in this.heirarchydata) {
            if ({}.hasOwnProperty.call(this.heirarchydata, key)) {
                if(key === value.key) {
                    this.data = this.heirarchydata[key];
                }
            }
        }
    }
    @api get ischildpresent() {
        return this.tempheirarchy.length !== 0 ? true : false;
    }
    @api get dynamicclass() {
        return 'hv-item-data' + (this.tempheirarchy.length !== 0 ? ' hv-item-parent' : '');
    }
    
    drag(evt) {
        const selectedEvent = new CustomEvent("customdrag", {
            detail: evt.target.getAttribute('data-id')
        });
        this.dispatchEvent(selectedEvent);
    }
    drop(event) {
        let element = event.target;
        let currentId;
        while((currentId === undefined || currentId === null) && !element.classList.contains('hv-item-data')) {
            currentId = element.getAttribute('data-id');
            element = element.parentElement;
        }
        event.preventDefault();
        const selectedEvent = new CustomEvent("customdrop", {
            detail: currentId
        });
        this.dispatchEvent(selectedEvent);
    }
    allowDrop(event) {
        event.preventDefault();
    }
    handleCustomDrag(event) {
        const selectedEvent = new CustomEvent("customdrag", {
            detail: event.detail
        });
        this.dispatchEvent(selectedEvent);
    }
    handleCustomDrop(event) {
        const selectedEvent = new CustomEvent("customdrop", {
            detail: event.detail
        });
        this.dispatchEvent(selectedEvent);
    }
    handleEditHeirarchyRecord(event) {
        const selectedEvent = new CustomEvent("editheirarchyrecord", {
            detail: event.detail
        });
        this.dispatchEvent(selectedEvent);
    }
    handleCreateHeirarchyRecord(event) {
        const selectedEvent = new CustomEvent("createheirarchyrecord", {
            detail: event.detail
        });
        this.dispatchEvent(selectedEvent);
    }
    handleDeleteHeirarchyRecord(event) {
        const selectedEvent = new CustomEvent("deleteheirarchyrecord", {
            detail: event.detail
        });
        this.dispatchEvent(selectedEvent);
    }
}