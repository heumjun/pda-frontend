/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.d.ts"/>

/**
 * 그리드에서 수정된 셀 강조하기
 * GridFactory 클래스에서 자동으로 호출됨.
 */
export class EditHighlighter{

    constructor(grid,cssClass){
        this._originalValues = new Map();
        this._grid = grid;
        let cellChanging = this._cellChanging.bind(this);
        let cellChanged = this._cellChanged.bind(this);
        grid.beginningEdit.addHandler(cellChanging);
        grid.cellEditEnded.addHandler(cellChanged);
        grid.pastingCell.addHandler(cellChanging);
        grid.pastedCell.addHandler(cellChanged);
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let changed = this._hasChange(e.getRow().dataItem, e.getColumn().binding);
                wijmo.toggleClass(e.cell, cssClass, changed);
            }
        });

    }

    /**
     * Clears all the changes and removes all highlights.
     */
    clearChanges() {
        this._originalValues.clear();
        this._grid.invalidate();
    }

    // checks whether a cell has changed
    _hasChange(item, binding) {
        item = this._originalValues.get(item);
        return item != null && !wijmo.isUndefined(item[binding]);
    }
    // handles cell changing (edit or paste)
    _cellChanging(s, e) {
        this._originalValue = s.getCellData(e.row, e.col, false);
    }
    // handles cell changed (edit or paste)
    _cellChanged(s, e) {
        if(wijmo.isUndefined(e.getRow())) return;
        let newValue = s.getCellData(e.row, e.col, false);
        this._storeChange(e.getRow().dataItem, e.getColumn().binding, this._originalValue, newValue);
    }
    // store a change into the _originalValues map
    _storeChange(item, binding, originalValue, newValue) {
        // get the item with the original values
        let editItem = this._originalValues.get(item);
        if (editItem == null) {
            editItem = {};
            this._originalValues.set(item, editItem);
        }
        // get the original value from the item if possible
        let editValue = editItem[binding];
        if (!wijmo.isUndefined(editValue)) {
            originalValue = editValue;
        }
        // store or clear the change
        if (this._sameValue(originalValue, newValue)) {
            delete editItem[binding];
            if (Object.keys(editItem).length == 0) {
                this._originalValues.delete(item);
            }
        }
        else {
            editItem[binding] = originalValue;
        }
    }
    // compare two values taking dates into account
    _sameValue(item1, item2) {
        if (item1 === item2) {
            return true;
        }
        if (wijmo.isDate(item1) && wijmo.isDate(item2)) {
            return item1.getTime() == item2.getTime();
        }
        return false;
    }
}