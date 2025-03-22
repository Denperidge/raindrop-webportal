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
        let style = ".link";
        for (let i=0; i < enabledTags.length; i++) {
            style += ":not(." + enabledTags[i] + ")"
        }
        style += " { display: none; }";
        dynamicStyle.innerText = style;
    }
    /*
    console.log(enabledTags)
    for (let i = 0; i < links.length; i++) {
        const linkTags = Array.from(links[i].classList);
        linkTags.shift();  // Remove link class        
    }*/

}

function init() {
    document.body.classList.remove("no-js");
    document.body.classList.add("js-only");

    enableEnterOnButtonLabels();

    document.head.appendChild(dynamicStyle);

    /*
    const taglabels = document.querySelectorAll(".js-only.taglabel");
    for (let i=0; i < taglabels.length; i++) {
        taglabels[i].addEventListener("click", (e) => {
            const pressedTag = label.getAttribute("for");

            document.querySelectorAll("[for='" + pressedTag + "'");
            console.log()
        })
    }*/
    
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