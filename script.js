

const init = async () => {

    const data = __dataBank[161];
    let {title, columns, records} = data; // object destructuring assignment

    const filterDiv = document.querySelector("#filters");
    
    // this will house an array of records in the DOM (after built)
    let recordList = {};

    // grab all column names that are defined as filters.
    const filterKeys = columns.filter(col => col.filter ).map(col => col.name);


    // build list of unique values for each filter key/col
    // in form values[key] = [val1, val2, val3, ...]
    // this is built only for purposes of building the filter section UI.
    let values = [];
    let ids = 0;
    records.forEach(rec => {
        rec.id = ids++; // assign id to record, and data-id to record divs below
        filterKeys.forEach( key => {
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
    filterKeys.forEach( key => {

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

        records.forEach( rec => {
            let div = document.createElement("div");
            div.classList.add("record", "row", "selected");
            div.setAttribute("data-id", rec.id);  // so I can connect records and divs
            columns.forEach( col => {
                addElem(div, "p", rec[col.name], "cell", col.name)
            });
            listDiv.append(div);
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

        if(this.classList.contains("selected")) {
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


    // column header click handler
    // sort by clicked column - attach "ascending" class to the .header.cell
    // again, old-school function syntax to preserve 'this'
    // easiest will be to sort input array and rebuild/replace the DOM, i think...
    // nope.  rebuilding kills our filtering.  need to sort in place.
    function sortColumn() {

        // figure out which column we're sorting...        
        const sortKey = this.textContent;
        // get the class name (sort key with spaces xlated to dashes)
        // see buildRecords above
        //const clsName = sortKey.split(" ").join("-");
        //console.log(clsName);

        const column = columns.find( col => col.name === sortKey);
        // ... and whether it's numeric...
        const isNumeric = (column) ? column.numeric : false;
        // ... and which way (asc or desc)
        this.classList.toggle("ascending");
        const sortDir = this.classList.contains("ascending") ? -1 : 1;

        recordList.sort( (a, b) => {
                
            // I stuffed the col name as a class for each cell.
            // so now we can retrieve the column we want using getElementsByClassName.
            // this returns an HTML collection, so we take the [0]th one.
            let aval = a.getElementsByClassName(sortKey)[0].textContent;
            let bval = b.getElementsByClassName(sortKey)[0].textContent;

            return (isNumeric) ? 
                (+aval < +bval ? sortDir : -sortDir) :
                ( aval.toUpperCase() < bval.toUpperCase()) ? sortDir : -sortDir;
        })

        // finally, map to reinsert back into container, in order.
        .map( itm => itm.parentNode.appendChild(itm));


    }


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

        recordList.forEach( rec => {
            let pass = true;
            Object.keys(filters).forEach(key => {
                let val = filters[key];
                if (val) {  // only perform check when this filter key has a value
                    let recVal = rec.getElementsByClassName(key)[0].textContent;
                    if (recVal && recVal != val) {
                        pass = false;
                    }
                }
            });

            // apply filter to this record
            rec.classList.toggle("selected", pass);

        });
    }

    // build record DOM
    buildHeader();
    buildRecords();

}


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