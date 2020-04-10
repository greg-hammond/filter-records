
// ** needs live server (or similar) for fetch to work........


// TODO:
// - deselect one filter / all filters
// - add record header line
// - add "select" button (that's the point - we're trying to determine 1 record )
// - test with another data set.  this code should be completely generic - each json file should provide what's needed.



const init = async () => {

    const data = await loadJSON("data/161insul.json");
    const {columns, filterKeys, records} = data;

    const filterDiv = document.querySelector("#filters");
    const recordDiv = document.querySelector("#records");


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


    //----- build out the filter DOM

    filterKeys.forEach( key => {

        let div = document.createElement("div");
        div.classList.add("keyval-list");
        div.setAttribute("data-key", key);

        // create filter key/header button
        addElem(div, "p", "key", key);


        // create buttons for each filter value for key
        values[key].forEach(val => {
            let el = addElem(div, "p", "val", val);
            el.addEventListener("click", setFilterValue);
        });

        filterDiv.append(div);
    })


    //----- build out the record DOM

    // build the column header row
    let div = document.createElement("div");
    div.classList.add("header");
    columns.forEach(col => addElem(div, "p", "cell", col));
    recordDiv.append(div);

    // build record rows
    records.forEach( rec => {
        let div = document.createElement("div");
        div.classList.add("record", "selected");
        div.setAttribute("data-id", rec.id);  // so I can connect records and divs
        columns.forEach( col => addElem(div, "p", "cell", rec[col]));
        recordDiv.append(div);
    })


    // click handler for all filter item value buttons
    // use traditional function syntax so 'this' is the clicked button
    function setFilterValue() {
        // loop through all buttons for this filter value group
        // set the clicked one as selected, all others as not.

        this.parentNode.querySelectorAll(".val").forEach(itm => {
            let classes = itm.classList;
            (itm === this) ? classes.add("selected") : classes.remove("selected");
        });

        // now filter recs against this value!
        updateRecordDisplay();
    }


    //----- display records with filtering.

    const updateRecordDisplay = () => {

        let filters = {};

        [...filterDiv.querySelectorAll("[data-key]")].forEach(div => {
            let key = div.getAttribute("data-key");
            let valBtn = div.querySelector(".selected");
            let val = (valBtn) ? valBtn.textContent : "";
            filters[key] = val;
        });


        // loop on records and perform filtering

        records.forEach( rec => {
            let pass = true;
            // loop against filter keys, not all record columns!
            Object.keys(filters).forEach(key => {
                let val = filters[key];
                if (val) {
                    if (rec[key] && rec[key] != val) {
                        pass = false;
                    }
                }
            });
            // find the record in the DOM
            let div = recordDiv.querySelector("div[data-id='" + rec.id + "']");
            let classes = div.classList;
            (pass) ? classes.add("selected") : classes.remove("selected");
        });

    }


    // do initial record display
    updateRecordDisplay();

}


async function loadJSON(file) {
    const resp = await fetch(file);
    data = await resp.json();
    return data;
};

// helper function.  create element of 'type' with 'classlist' and 'text' content, and append to 'parent'
const addElem = (parent, type, classlist, text) => {
    let elem = document.createElement(type);
    elem.classList = classlist;
    elem.textContent = text;
    parent.appendChild(elem);
    return elem;
}



window.onload = init;