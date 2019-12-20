public without sharing class HeirarchyController {
    @AuraEnabled
    public static String initialize() {
        HeirarchyWrapper wrapper = new HeirarchyWrapper();
        List<Heirarchy__c> dataSet = [SELECT Id, Name, Name_Initials__c, Role__c, Image__c, Parent__c FROM Heirarchy__c ORDER BY Parent__c ASC];
        wrapper.dataSet = new Map<Id, Heirarchy__c>(dataSet);
        wrapper.childToParentRelation = new Map<String, String>();
        for(Heirarchy__c heirarchy : dataSet) {
            wrapper.childToParentRelation.put(heirarchy.Id, heirarchy.Parent__c);
        }
        wrapper.mapOfHeirarchy = new Map<String, Object>();
        Map<String, Object> tempMap;
        for(String str : wrapper.childToParentRelation.keySet()) {
            List<String> listOfParentIds = getListOfParentIds(wrapper.childToParentRelation, str);
            setMapValue(wrapper.mapOfHeirarchy, wrapper.childToParentRelation, listOfParentIds, str);
        }
        return JSON.serialize(wrapper);
    }

    @AuraEnabled
    public static void setParentHeirarchyLookupToChild(Id parentId, Id childId){
        Heirarchy__c heirarchy = new Heirarchy__c(Id = childId, Parent__c = parentId);
        update heirarchy;
    }

    @AuraEnabled
    public static String deleteHeirarchyRecordAndUpdateParent(Id recordIdToDelete, Id parentId, String childIdsStr){
        Heirarchy__c heirarchy = new Heirarchy__c(Id = recordIdToDelete);
        delete heirarchy;
        if(parentId != null) {
            List<Id> childIds = (List<Id>)JSON.deserialize(childIdsStr, List<Id>.class);
            List<Heirarchy__c> heirarchyList = new List<Heirarchy__c>();
            for(Id childId : childIds) {
                heirarchy = new Heirarchy__c(Id = childId, Parent__c = parentId);
                heirarchyList.add(heirarchy);
            }
            update heirarchyList;
        }
        return initialize();
    }

    public static List<String> getListOfParentIds(Map<String, String> childToParentRelation, String childId) {
        List<String> listOfParentIds = new List<String>();
        while(childToParentRelation.get(childId) != null) {
            listOfParentIds.add(childToParentRelation.get(childId));
            childId = childToParentRelation.get(childId);
        }
        return listOfParentIds;
    }

    public static void setMapValue(Map<String, Object> mapOfHeirarchy, Map<String, String> childToParentRelation, List<String> parentIds, String childId){
        if(parentIds.size() == 0) {
            if(mapOfHeirarchy.get(childId) == null){
                mapOfHeirarchy.put(childId, new Map<String, Object>());
            }
        } else if(parentIds.size() == 1) {
            Map<String, Object> tempMap;
            if(mapOfHeirarchy.get(parentIds[0]) == null) {
                tempMap = new Map<String, Object>{childId => new Map<String, Object>()};
            } else {
                tempMap = (Map<String, Object>)mapOfHeirarchy.get(parentIds[0]);
                if(tempMap.get(childId) == null){
                    tempMap.put(childId, new Map<String, Object>());
                }
            }
            mapOfHeirarchy.put(parentIds[0], tempMap);
        } else {
            String parentId = parentIds.remove(parentIds.size() - 1);
            if(mapOfHeirarchy.get(parentId) == null) {
                mapOfHeirarchy.put(parentId, new Map<String, Object>());
            }
            setMapValue((Map<String, Object>)mapOfHeirarchy.get(parentId), childToParentRelation, parentIds, childId);
        }
    }

    public class HeirarchyWrapper {
        public Map<Id, Heirarchy__c> dataSet;
        public Map<String, String> childToParentRelation;
        public Map<String, Object> mapOfHeirarchy;
    }
}