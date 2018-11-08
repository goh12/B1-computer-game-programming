function DebugPrinter() {
    this.objects = [];
    
    this.debugPrinter = document.createElement("div");
    this.debugPrinter.style.display = "inline-block";
    this.debugPrinter.style.maxWidth = "400px";
    this.debugPrinter.style.padding = "10px";
    document.body.appendChild(this.debugPrinter);
}

/** 
 * 
 * @param {object} object
 * @param {...} attributes list of strings with name of attributes to be printed
*/
DebugPrinter.prototype.add = function(label, object, attributes) {

    const container = document.createElement("div");
    const _label = document.createElement("label");
    _label.style.color = "blue";
    _label.textContent = label;
    const ul = document.createElement("ul");

    const fields = [];

    for(let i = 0; i < attributes.length; i++) {
        const li = document.createElement("li");
        ul.appendChild(li);
        fields.push(li);
    }

    this.debugPrinter.appendChild(container);
    container.appendChild(_label);
    container.appendChild(document.createElement("br"));
    container.appendChild(ul);


    this.objects.push({ object, attributes, fields });

    this.update();
}

DebugPrinter.prototype.update = function() {
    for(let i = 0; i < this.objects.length; i++) {
        const ob = this.objects[i];
        if (ob.object._isDeadNow) {
            const div = ob.fields[0].parentNode.parentNode.innerHTML = "";
            this.objects.splice(i, 1);
            i--;
            continue;
        }
        for(let j = 0; j < ob.attributes.length; j++) {
            const attr = ob.attributes[j];
            ob.fields[j].textContent = 
                	attr + " : " + ob.object[attr];
        }
    }
}

const debugPrinter = new DebugPrinter();