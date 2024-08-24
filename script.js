document.getElementById('cantidadGeomembranas').addEventListener('input', function() {
    const cantidad = this.value;
    const container = document.getElementById('geomembranasContainer');
    container.innerHTML = '';

    for (let i = 0; i < cantidad; i++) {
        container.innerHTML += `
            <div class="form-group">
                <h3>Geomembrana ${i + 1}</h3>
                <label for="codigoRollo${i}">Código de Rollo N°:</label>
                <input type="text" id="codigoRollo${i}" required>
                
                <div class="status-group">
                    <div class="status-item">
                        <label>Estado General:</label>
                        <label><input type="checkbox" id="estadoGeneralBien${i}" value="bien"> Bien</label>
                        <label><input type="checkbox" id="estadoGeneralMal${i}" value="mal"> Mal</label>
                    </div>
                    <div class="status-item">
                        <label>Enrollado:</label>
                        <label><input type="checkbox" id="enrolladoBien${i}" value="bien"> Bien</label>
                        <label><input type="checkbox" id="enrolladoMal${i}" value="mal"> Mal</label>
                    </div>
                    <div class="status-item">
                        <label>Esquinas:</label>
                        <label><input type="checkbox" id="esquinasBien${i}" value="bien"> Bien</label>
                        <label><input type="checkbox" id="esquinasMal${i}" value="mal"> Mal</label>
                    </div>
                    <div class="status-item">
                        <label>Fajas:</label>
                        <label><input type="checkbox" id="fajasBien${i}" value="bien"> Bien</label>
                        <label><input type="checkbox" id="fajasMal${i}" value="mal"> Mal</label>
                    </div>
                </div>

                <label for="observaciones${i}">Observaciones:</label>
                <input type="text" id="observaciones${i}">
                <label for="fotoGeomembrana${i}">Foto:</label>
                <input type="file" id="fotoGeomembrana${i}" accept="image/*">
            </div>
        `;
    }
});


async function generarPDF() {
    const doc = new jsPDF();
    let yPosition = 20; // Posición inicial en la primera hoja
    const lineHeight = 8; // Altura de cada línea de texto
    const pageHeight = doc.internal.pageSize.height; // Altura de la página
    const imgWidth = 50; // Ancho de la miniatura
    const stateWidth = 30; // Ancho para los textos "Bien" y "Mal"
    const spacing = 60; // Espaciado horizontal entre columnas

    // Función para agregar texto y manejar salto de página si es necesario
    function addTextToPDF(text, fontSize = 10) {
        doc.setFontSize(fontSize);
        if (yPosition + lineHeight > pageHeight) {
            doc.addPage();
            yPosition = 20; // Reiniciar la posición al principio de la nueva página
        }
        doc.text(20, yPosition, text);
        yPosition += lineHeight;
    }

    // Función para agregar imágenes y manejar salto de página si es necesario
    function addImageToPDF(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    const imgHeight = (img.height * imgWidth) / img.width; // Mantener proporción
                    if (yPosition + imgHeight > pageHeight) {
                        doc.addPage();
                        yPosition = 20; // Reiniciar la posición al principio de la nueva página
                    }
                    doc.addImage(img, 'JPEG', 20, yPosition, imgWidth, imgHeight);
                    yPosition += imgHeight + 10; // Espacio adicional después de la imagen
                    resolve();
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    }

    // Función para agregar el estado de una geomembrana en formato horizontal
    function addStateRowToPDF(estadoGeneral, enrollado, esquinas, fajas) {
        const startX = 20;
        const yOffset = 0;

        doc.setFontSize(10);

        // Agregar encabezados
        doc.text(startX, yPosition, 'Estado General');
        doc.text(startX + spacing, yPosition, 'Enrollado');
        doc.text(startX + 2 * spacing, yPosition, 'Esquinas');
        doc.text(startX + 3 * spacing, yPosition, 'Fajas');

        // Agregar estados
        yPosition += 10; // Espacio entre encabezado y los valores

        doc.text(startX, yPosition, estadoGeneral === 'Bien' ? 'Bien' : '');
        doc.text(startX + spacing, yPosition, enrollado === 'Bien' ? 'Bien' : '');
        doc.text(startX + 2 * spacing, yPosition, esquinas === 'Bien' ? 'Bien' : '');
        doc.text(startX + 3 * spacing, yPosition, fajas === 'Bien' ? 'Bien' : '');

        doc.text(startX, yPosition + 10, estadoGeneral === 'Mal' ? 'Mal' : '');
        doc.text(startX + spacing, yPosition + 10, enrollado === 'Mal' ? 'Mal' : '');
        doc.text(startX + 2 * spacing, yPosition + 10, esquinas === 'Mal' ? 'Mal' : '');
        doc.text(startX + 3 * spacing, yPosition + 10, fajas === 'Mal' ? 'Mal' : '');

        yPosition += 30; // Espacio adicional después de la fila de estados
    }

    // Recoger datos del formulario
    const nombreConductor = document.getElementById('nombreConductor').value;
    const fechaArribo = document.getElementById('fechaArribo').value;
    const facturaComercial = document.getElementById('facturaComercial').value;
    const cartaPorte = document.getElementById('cartaPorte').value;
    const cantidadGeomembranas = document.getElementById('cantidadGeomembranas').value;

    // Añadir los datos al PDF
    addTextToPDF(`Nombre y Apellido - Conductor: ${nombreConductor}`);
    addTextToPDF(`Fecha de Arribo: ${fechaArribo}`);
    addTextToPDF(`Factura Comercial: ${facturaComercial}`);
    addTextToPDF(`N° Carta Porte: ${cartaPorte}`);
    addTextToPDF(`Cantidad de Geomembranas: ${cantidadGeomembranas}`);

    // Añadir imagen de la carta porte
    const fotoCartaPorte = document.getElementById('fotoCartaPorte').files[0];
    if (fotoCartaPorte) {
        await addImageToPDF(fotoCartaPorte);
    }

    for (let i = 0; i < cantidadGeomembranas; i++) {
        const codigoRollo = document.getElementById(`codigoRollo${i}`).value;
        const estadoGeneral = document.querySelector(`#estadoGeneralBien${i}:checked`) ? 'Bien' : (document.querySelector(`#estadoGeneralMal${i}:checked`) ? 'Mal' : 'No especificado');
        const enrollado = document.querySelector(`#enrolladoBien${i}:checked`) ? 'Bien' : (document.querySelector(`#enrolladoMal${i}:checked`) ? 'Mal' : 'No especificado');
        const esquinas = document.querySelector(`#esquinasBien${i}:checked`) ? 'Bien' : (document.querySelector(`#esquinasMal${i}:checked`) ? 'Mal' : 'No especificado');
        const fajas = document.querySelector(`#fajasBien${i}:checked`) ? 'Bien' : (document.querySelector(`#fajasMal${i}:checked`) ? 'Mal' : 'No especificado');
        const observaciones = document.getElementById(`observaciones${i}`).value;

        addTextToPDF(`Geomembrana ${i + 1}`, 12); // Tamaño de fuente mayor para los encabezados
        addTextToPDF(`Código de Rollo N°: ${codigoRollo}`);
        addStateRowToPDF(estadoGeneral, enrollado, esquinas, fajas);
        addTextToPDF(`Observaciones: ${observaciones}`);

        // Añadir imagen de la geomembrana
        const fotoGeomembrana = document.getElementById(`fotoGeomembrana${i}`).files[0];
        if (fotoGeomembrana) {
            await addImageToPDF(fotoGeomembrana);
        }
    }

    doc.save('formulario_transporte.pdf');
}
///////////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {
    const generarPDFButton = document.querySelector('button[onclick="generarPDFInterno()"]');
    if (generarPDFButton) {
        generarPDFButton.addEventListener('click', generarPDFInterno);
    }
});

async function generarPDFInterno() {
    const doc = new jsPDF();
    let yPosition = 20; // Posición inicial en la primera hoja
    const lineHeight = 8; // Altura de cada línea de texto
    const pageHeight = doc.internal.pageSize.height; // Altura de la página

    // Función para agregar texto y manejar salto de página si es necesario
    function addTextToPDF(text, fontSize = 10) {
        doc.setFontSize(fontSize);
        if (yPosition + lineHeight > pageHeight) {
            doc.addPage();
            yPosition = 20; // Reiniciar la posición al principio de la nueva página
        }
        doc.text(20, yPosition, text);
        yPosition += lineHeight;
    }

    // Función para agregar imágenes y manejar salto de página si es necesario
    function addImageToPDF(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    const imgWidth = 50; // Ancho de la miniatura
                    const imgHeight = (img.height * imgWidth) / img.width; // Mantener proporción
                    if (yPosition + imgHeight > pageHeight) {
                        doc.addPage();
                        yPosition = 20; // Reiniciar la posición al principio de la nueva página
                    }
                    doc.addImage(img, 'JPEG', 20, yPosition, imgWidth, imgHeight);
                    yPosition += imgHeight + 10; // Espacio adicional después de la imagen
                    resolve();
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    }

    // Recoger datos del formulario
    const fechaTransferencia = document.getElementById('fechaTransferencia')?.value || '';
    const codigoServicio = document.getElementById('codigoServicio')?.value || '';
    
    // Obtener los valores seleccionados de los checkboxes y formatearlos para el PDF
    function formatSelectedCheckboxes(name, label) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        if (checkboxes.length === 0) return `Ninguno seleccionado`;
        return `${label}: ${Array.from(checkboxes).map(checkbox => checkbox.value).join(', ')}`;
    }

    // Añadir los datos al PDF
    addTextToPDF(`Fecha de Transferencia de Carga: ${fechaTransferencia}`);
    addTextToPDF(`Código de Servicio: ${codigoServicio}`);
    
    const plataformaControl = formatSelectedCheckboxes('plataformaControl', 'Plataforma Control Doc');
    addTextToPDF(plataformaControl);
    
    const nombreConductorGVH = document.getElementById('nombreConductorGVH')?.value || '';
    addTextToPDF(`Nombre y Apellido Conductor GVH: ${nombreConductorGVH}`);
    const estadoConductor = formatSelectedCheckboxes('estadoConductor', 'Estado de Conductor');
    addTextToPDF(estadoConductor);
    
    const patenteTractor = document.getElementById('patenteTractor')?.value || '';
    addTextToPDF(`Patente Tractor: ${patenteTractor}`);
    const estadoTractor = formatSelectedCheckboxes('estadoTractor', 'Estado de Tractor');
    addTextToPDF(estadoTractor);
    
    const patenteSemi = document.getElementById('patenteSemi')?.value || '';
    addTextToPDF(`Patente Semi: ${patenteSemi}`);
    const estadoSemi = formatSelectedCheckboxes('estadoSemi', 'Estado de Semi');
    addTextToPDF(estadoSemi);
    
    const fechaEntregaCliente = document.getElementById('fechaEntregaCliente')?.value || '';
    addTextToPDF(`Fecha de Entrega a Cliente: ${fechaEntregaCliente}`);
    
    // Añadir imagen de la carga en tránsito
    const fotoCargaTransito = document.getElementById('fotoCargaTransito')?.files[0];
    if (fotoCargaTransito) {
        await addImageToPDF(fotoCargaTransito);
    }

    doc.save('formulario_interno.pdf');
}
