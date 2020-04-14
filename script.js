
// ** needs live server (or similar) for fetch to work........
// ==> for now, revert to a local script var data = blah blah blah


// TODO:
// - add record header line
// - add "select" button (that's the point - we're trying to determine 1 record )
// - test with another data set.  this code should be completely generic - each json file should provide what's needed.
// - filters themselves should react to other filters.  e.g. if i pick "R-19", the other filter 
//   values should indicate whether (or how many) matches there are for each attribute.  
//   might get icky...
//   sort records by columns


const init = async () => {

    //const data = await loadJSON("data/161insul.json");
    const data = __dataBank[161];
    let {title, columns, records} = data; // object destructuring assignment

    const filterDiv = document.querySelector("#filters");
    const headerDiv = document.querySelector("#header");
    const recordDiv = document.querySelector("#records");

    const filterKeys = columns.filter( col => col.filter ).map( col => col.name);


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
    document.querySelector("#title").textContent = data.title;

    //----- build out the filter DOM

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


    //----- build out the record DOM

    const buildHeader = () => {

        // build the column header row
        let div = document.createElement("div");
        div.classList.add("row", "header");
        columns.forEach(col => {
            let elem = addElem(div, "p", col.name, "cell");
            // add click handling on header cells for sorting by column
            elem.addEventListener("click", sortColumn);
        });
        headerDiv.append(div);
    }



    const buildRecords = () => {

        recordDiv.innerHTML = "";   // @@kludge-o-matic

        // build record rows
        records.forEach( rec => {
            let div = document.createElement("div");
            div.classList.add("record", "row", "selected");
            div.setAttribute("data-id", rec.id);  // so I can connect records and divs
            columns.forEach( col => addElem(div, "p", rec[col.name], "cell"));
            recordDiv.append(div);
        })


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

        // now filter recs against this value!
        updateRecordDisplay();
    }


    // column header click handler
    // sort by clicked column - attach "ascending" class to the .header.cell
    // again, old-school function syntax to preserve 'this'
    // easiest will be to sort input array and rebuild/replace the DOM, i think...
    // this sorts everything as string :-( --> need ot handle numeric sort.
    // 
    function sortColumn() {

        
        const sortKey = this.textContent;
        const column = columns.find( col => col.name === sortKey);
        const isNumeric = (column) ? column.numeric : false;
        console.log(isNumeric);
        this.classList.toggle("ascending");
        const sortDir = this.classList.contains("ascending") ? -1 : 1;
        records = records.sort( (a, b) => {

            return (isNumeric) ?
                (+a[sortKey] < +b[sortKey] ? sortDir : -sortDir) :
                (a[sortKey].toUpperCase() < b[sortKey].toUpperCase() ? sortDir : -sortDir);

        });

        buildRecords();

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
            div.classList.toggle("selected", pass);

        });
    }

    // build record DOM
    buildHeader();
    buildRecords();

    // do initial record display
    updateRecordDisplay();

}

// not using for now.  loading variable directly from script data.js
// async function loadJSON(file) {
//     const resp = await fetch(file, {
//         method: 'GET',
//         mode: 'no-cors',
//         headers: {
//             'Content-Type': 'application/json',
//             'Access-Control-Allow-Origin': '*'
//         }
//     });
//     data = await resp.json();
//     return data;
// };

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