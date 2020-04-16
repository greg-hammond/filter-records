

const init = () => {

    const data = __dataBank[179];
    let { title, columns, records } = data; // object destructuring assignment

    const filterDiv = document.querySelector("#filters");

    // this will house an array of records in the DOM (after built)
    let recordList = {};

    // grab all column names that are defined as filters.
    const filterKeys = columns.filter(col => col.filter).map(col => col.name);


    // build list of unique values for each filter key/col
    // in form values[key] = [val1, val2, val3, ...]
    // this is built only for purposes of building the filter section UI.
    // @@@todo: sort values within each filter
    let values = [];
    records.forEach(rec => {
        filterKeys.forEach(key => {
            const value = rec[key];
            values[key] = values[key] || [];
            if (values[key].indexOf(value) == -1) {
                values[key] = [...values[key], value];
            }
        })
    });


    //----- add the title
    document.querySelector("#title").textContent = title;


    //----- build the filter UI
    filterKeys.forEach(key => {

        let div = document.createElement("div");
        div.classList.add("keyval-list");
        div.setAttribute("data-key", key);

        // create filter key/header button
        addElem(div, "p", key, "key");

        // create buttons for each filter value for key
        values[key].forEach(val => {
            let el = addElem(div, "p", val, "val");
            el.addEventListener("click", setFilterValue);
        });

        filterDiv.append(div);
    })


    //----- build record column header

    const buildHeader = () => {

        // build the column header row
        const header = document.querySelector("#header");
        const div = addElem(header, "div", "", "row", "header");
        columns.forEach(col => {
            let elem = addElem(div, "p", col.name, "cell");
            elem.addEventListener("click", sortColumn);  // sort column on click
        });
    }

    //----- build out record DOM from record data

    const buildRecords = () => {

        // build records into the UI
        // note that 'records' object not used after DOM built

        const listDiv = document.querySelector("#records");

        records.forEach(rec => {
            let div = addElem(listDiv, "div", "", "record", "row", "selected");
            columns.forEach(col => {
                let cell = addElem(div, "p", rec[col.name], "cell");
                // this supports retrieving data by column - see getColData
                cell.setAttribute("data-col", col.name);
            });
        });

        // used for filtering and sorting later
        recordList = [...listDiv.querySelectorAll(".record")];

    }



    // filter button click handler
    // use traditional function syntax so 'this' is the clicked button
    //
    function setFilterValue() {
        // loop through all buttons for this filter value group
        // set the clicked one as selected, all others as not.

        if (this.classList.contains("selected")) {
            // we clicked to de-select the already-selected one.
            this.classList.remove("selected");

        } else {
            // we select the one that was clicked, de-select all others.
            this.parentNode.querySelectorAll(".val").forEach(itm => {
                itm.classList.toggle("selected", itm === this);
            });
        }

        // now filter recs against this value
        filterRecords();
    }


    // helper function - fetch column data for a record
    // called by filter code and sort code
    //
    const getColData = (rec, col) => rec.querySelector(`[data-col=${col}]`).textContent;




    //----- filter record display based on selected filters
    //      called initially, and when any filter settings are changed by user
    //
    const filterRecords = () => {

        let filters = {};

        [...filterDiv.querySelectorAll("[data-key]")].forEach(div => {
            let key = div.getAttribute("data-key");
            // only 0 or 1 filter values per attribute supported, for now
            let valBtn = div.querySelector(".selected");
            let val = (valBtn) ? valBtn.textContent : "";
            filters[key] = val;
        });


        // loop on records and perform filtering

        recordList.forEach(rec => {
            let pass = true;
            Object.keys(filters).forEach(key => {
                let val = filters[key];
                if (val) { 
                    let recVal = getColData(rec, key);
                    if (recVal && recVal != val) {
                        pass = false;
                    }
                }
            });

            // apply filter to this record
            rec.classList.toggle("selected", pass);

        });
    }




    // column header click handler
    //
    function sortColumn() {

        // figure out which column we're sorting...        
        const sortKey = this.textContent;
        const column = columns.find(col => col.name === sortKey);
        // ... and whether it's numeric...
        const isNumeric = (column) ? column.numeric : false;
        // ... and which way (asc or desc)
        this.classList.toggle("ascending");
        const sortDir = this.classList.contains("ascending") ? -1 : 1;

        recordList.sort((a, b) => {

            // fetch column data for each record
            let aval = getColData(a, sortKey);
            let bval = getColData(b, sortKey);

            return (isNumeric) ?
                (+aval < +bval ? sortDir : -sortDir) :
                (aval.toUpperCase() < bval.toUpperCase()) ? sortDir : -sortDir;
        })

            // finally, map to reinsert back into container, in order.
            .map(itm => itm.parentNode.appendChild(itm));


    }

    // build record DOM
    buildHeader();
    buildRecords();

} // end init




// helper function.  create element of 'type' with 'text' content, and append to 'parent'
// multiple classnames can be passed in as parameters 4-n.  spread operator handles nicely.
const addElem = (parent, type, text, ...classlist) => {
    let elem = document.createElement(type);
    elem.classList.add(...classlist);
    elem.textContent = text;
    parent.appendChild(elem);
    return elem;
}



window.onload = init;