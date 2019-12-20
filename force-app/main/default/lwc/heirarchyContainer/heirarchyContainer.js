import { LightningElement, track } from 'lwc';
import initialize from '@salesforce/apex/HeirarchyController.initialize';
import setParentHeirarchyLookupToChild from '@salesforce/apex/HeirarchyController.setParentHeirarchyLookupToChild';
import deleteHeirarchyRecordAndUpdateParent from '@salesforce/apex/HeirarchyController.deleteHeirarchyRecordAndUpdateParent';
import heirarchyRecordEditModal from 'c/heirarchyRecordEditModal';
export default class heirarchyContainer extends LightningElement {
    @track isInitialize = false;
    @track mainheirarchy;
    @track tempheirarchy;
    @track childToParent;
    @track data;
    @track draggedId;
    @track droppedId;
    @track editRecordData;
    _heirarchy;
    nullRecord;
    connectedCallback() {
        this.init();
        this.editRecordData = {
            recordId: null,
            recordData: {},
            isHeirarchyRecordModalOpen: false,
            heirarchyModalMode: 'edit'
        };
    }
    init() {
        initialize()
        .then(response => {
            response = JSON.parse(response);
            this.initializeData(response);
        })
        .catch()
    }
    initializeData(result) {
        this.mainheirarchy = result.mapOfHeirarchy;
        this.data = result.dataSet;
        this.childToParent = result.childToParentRelation;
        this.createTempHeirarchy(true);
        this.isInitialize = true;
    }
    createTempHeirarchy(isInit) {
        this.tempheirarchy = [];
        if(this.mainheirarchy != null &&  this.mainheirarchy !== undefined) {
            for (let key in this.mainheirarchy) {
                if ({}.hasOwnProperty.call(this.mainheirarchy, key)) {
                    this.tempheirarchy.push({'key': key, 'value': this.mainheirarchy[key]});
                }
            }
        }
        if(!isInit) {
            this.childToParent[this.draggedId] = this.droppedId;
        }
    }
    handleModalEvent(event) {
        this.editRecordData = {
            recordId: null,
            recordData: {},
            isHeirarchyRecordModalOpen: false,
            heirarchyModalMode: 'edit'
        };
        if(event.detail.type === 'upsert') {
            this.initializeData(JSON.parse(event.detail.data));
        }
    }
    handleCustomDrag(event) {
        this.draggedId = event.detail;
    }
    handleCustomDrop(event) {
        this.droppedId = event.detail;
        this.eventAfterDrop();
    }
    handleEditHeirarchyRecord(event) {
        this.editRecordData = {
            recordId: event.detail,
            recordData: this.data[event.detail],
            isHeirarchyRecordModalOpen: true,
            heirarchyModalMode: 'edit'
        };
    }
    handleCreateHeirarchyRecord(event) {
        this.editRecordData = {
            recordId: '',
            recordData: {
                Name: '',
                Role__c: '',
                Image__c: '',
                Parent__c: event.detail
            },
            isHeirarchyRecordModalOpen: true,
            heirarchyModalMode: 'edit'
        };
    }
    handleDeleteHeirarchyRecord(event) {
        let arr = this.getArray(event.detail, this.childToParent);
        let heirarchy = JSON.parse(JSON.stringify(this.mainheirarchy));
        let childIds = this.getValueByRecursionFromArray(heirarchy, arr, event.detail);
        let parentId = this.childToParent[event.detail];
        let childIdsArr = [];
        for(let childId in childIds) {
            if(1 === 1){
                childIdsArr.push(childId);
            }
        }
        deleteHeirarchyRecordAndUpdateParent({
            recordIdToDelete: event.detail,
            parentId:  parentId,
            childIdsStr: JSON.stringify(childIdsArr)
        })
        .then(response => {
            this.initializeData(JSON.parse(response));
        })
        .catch()
    }
    eventAfterDrop() {
        if(this.draggedId != null && this.draggedId !== undefined && this.droppedId != null && this.droppedId !== undefined && this.draggedId === this.droppedId) {
            return;
        }
        let arr = this.getArray(this.draggedId, this.childToParent);
        let arr1 = this.getArray(this.droppedId, this.childToParent);
        let heirarchy = JSON.parse(JSON.stringify(this.mainheirarchy));
        let value = this.getValueByRecursionFromArray(heirarchy, arr, this.draggedId);
        arr = arr1;
        if(this.addValueToDroppedItem(heirarchy, arr, this.droppedId, this.draggedId, value)) {
            this._heirarchy = heirarchy;
            this.updateParent(this.droppedId, this.draggedId);
        }
    }
    updateParent(parentId, childId) {
        // this.template.querySelector('lightning-record-edit-form').setAttribute("recordId", childId);
        // let fields = {"Id": childId, "Parent__c": parentId};
        // this.template.querySelector('lightning-record-edit-form').submit(fields);
        setParentHeirarchyLookupToChild({
            parentId: parentId,
            childId: childId
        })
        .then(response => {
            this.mainheirarchy = this._heirarchy;
            this.createTempHeirarchy(false);
        })
        .catch()
    }
    handleParentUpdateSuccess(event) {
        this.mainheirarchy = this._heirarchy;
        this.createTempHeirarchy(false);
    }
    getArray(dragDropId, childToParent) {
        var arr = [];
        while(childToParent[dragDropId] !== undefined && childToParent[dragDropId] !== null) {
            arr.push(childToParent[dragDropId]);
            dragDropId = childToParent[dragDropId];
        }
        return arr;
    }
    getValueByRecursionFromArray(heirarchy, arr, keyToDelete) {
        if(arr.length === 0) {
            let value = heirarchy[keyToDelete];
            delete heirarchy[keyToDelete];
            return value;
        } else if(arr.length === 1) {
            let value = heirarchy[arr[0]][keyToDelete];
            delete heirarchy[arr[0]][keyToDelete];
            return value;
        } else if(arr.length > 1 && heirarchy !== undefined && heirarchy !== null) {
            let index = arr.splice(-1, 1);
            return this.getValueByRecursionFromArray(heirarchy[index], arr, keyToDelete);
        }
        return null;
    }
    addValueToDroppedItem(heirarchy, arr, droppedId, draggedId, value) {
        if(arr.length === 0) {
            heirarchy[droppedId][draggedId] = value;
            return true;
        } else if(arr.length === 1) {
            if(heirarchy.hasOwnProperty(arr[0])) {
                if(heirarchy[arr[0]][droppedId] === null || heirarchy[arr[0]][droppedId] === undefined) heirarchy[arr[0]][droppedId] = {};
                heirarchy[arr[0]][droppedId][draggedId] = value;
                return true;
            }
            console.log('Cannot place in child');
        } else if(arr.length > 1) {
            if(heirarchy !== undefined && heirarchy !== null) {
                let index = arr.splice(-1, 1);
                return this.addValueToDroppedItem(heirarchy[index], arr, droppedId, draggedId, value);
            }
            console.log('Cannot place in child');
        }
        return false;
    }
}