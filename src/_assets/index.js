const links = document.querySelectorAll(".link");
const dynamicStyle = document.createElement("style");

function enableEnterOnButtonLabels () {
    const buttonLabels = document.querySelectorAll("label[role='button']")
    for (let i = 0; i < buttonLabels.length; i++) {
        buttonLabels[i].addEventListener("keyup", (e) => {
            if (e.code == "Enter") {
                e.target.click();
            }
        });
    }
}

function onTagChange(tagInputId, tagInputChecked) {
    const relevantTaglabels = document.querySelectorAll("[for='" + tagInputId + "'");
    for (let i=0; i < relevantTaglabels.length; i++) {
        relevantTaglabels[i].setAttribute("aria-pressed", tagInputChecked)
    }
    
    const enabledTags = Array.from(document.querySelectorAll("input:checked")).map((input) => input.id.replace(/^tag-/m, ""));
    if (enabledTags.length == 0) {
        dynamicStyle.innerText = "";
    } else {
        let style = ".link:not(." + enabledTags.join(".") + ") { opacity: 0.4; }";
        style += " nav"
        for (let i=0; i < enabledTags.length; i++) {
            style += ":not(#" + enabledTags[i] + ")"
        }
        style += " { display: none; }";

        dynamicStyle.innerText = style;
    }
}

function init() {
    document.body.classList.remove("no-js");
    document.body.classList.add("js-only");
    document.head.appendChild(dynamicStyle)
    
    enableEnterOnButtonLabels();;
    
    const tagInputs = document.querySelectorAll("#tags input");
    for (let i=0; i < tagInputs.length; i++) {
        const tagInput = tagInputs[i];
        onTagChange(tagInput.id, tagInput.checked);
 
        tagInput.addEventListener("change", (e) => {
            const target = e.target;
            if (!target) { console.error("tagInput event didn't return a valid target"); return; }
            onTagChange(target.id, target.checked)
        })
    }
    
}

init();