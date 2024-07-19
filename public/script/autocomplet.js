//Auto Completa em Tags e para cadastrar
// Function to split input value
function split(val) {
    return val.split(/,\s*/);
}

// Function to extract last term
function extractLast(term) {
    return split(term).pop();
}

// Autocomplete function
function setupAutocomplete(inputId, uniqueData) {
    $(inputId)
        .on("keydown", function(event) {
            if (event.keyCode === $.ui.keyCode.TAB &&
                $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            }
        })
        .autocomplete({
            minLength: 0,
            source: function(request, response) {
                response($.ui.autocomplete.filter(
                    uniqueData, extractLast(request.term)));
            },
            focus: function() {
                return false;
            },
            select: function(event, ui) {
                var terms = split(this.value);
                terms.pop();
                terms.push(ui.item.value);
                terms.push("");
                this.value = terms.join(", ");
                return false;
            }
        });
}

$(function() {
    // Setup autocomplete for #tags input
    setupAutocomplete("#tags", JSON.parse('<%- JSON.stringify(uniqueTags) %>'));

    // Setup autocomplete for #studio input
    setupAutocomplete("#studio", JSON.parse('<%- JSON.stringify(uniqueStudios) %>'));

    // Setup autocomplete for #atriz input
    setupAutocomplete("#atriz", JSON.parse('<%- JSON.stringify(uniqueAtriz) %>'));
});

function stopPropagation(event) {
    event.stopPropagation();
}