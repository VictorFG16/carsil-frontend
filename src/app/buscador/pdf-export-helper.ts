import  pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.vfs;


function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '';
    }

    // Usar UTC para evitar problemas de zona horaria
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
}

export function generateProductPdf(product: any, sizeSummary: { size: string; quantity: number }[], totalQuantity: number) {
  const body = [];

  // Header row for product details
  body.push([{ text: 'Detalle OP', style: 'tableHeader', colSpan: 2, alignment: 'center' }, {}]);

  // Product details rows
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    });
  };
  const productDetails = [
    ['OP', product.op],
    ['Referencia', product.reference],
    ['Marca', product.brand],
    ['Descripción', product.description],
    ['Campaña', product.campaign],
    ['Tipo', product.type],
    ['Fecha Asignada', formatDateForDisplay(product.assignedDate)],
    ['Fecha Entrada', formatDateForDisplay(product.plantEntryDate)],
    ['Cantidad', product.quantity],
    ['Precio', product.price != null ? formatCurrency(Number(product.price)) : ''],
    ['Precio Total', (product.price != null && product.quantity != null)? formatCurrency(Number(product.price) * Number(product.quantity)): ''],
    ['Estado', product.status || ''],
    ['Motivo de parada', product.stoppageReason || ''],
    ['Ciclo', product.cycleCalculated || ''],
    ['Cantidad confeccionada', product.quantityMade || ''],
    ['Cantidad faltante', product.quantityPending || ''],
    ['% de entrega', product.deliveryPercentage ? `${product.deliveryPercentage}%` : ''],
    ['Fecha de entrega real', formatDateForDisplay(product.actualDeliveryDate)],
    ['Equipo', product.module?.name || product.module || 'No asignado'],
    ['SAM', product.sam || ''],
    ['SAM total', product.samTotal || ''],
    ['Número de personas', product.numPersons || ''],
    ['Días de carga', product.loadDays || ''],
  ];
  productDetails.forEach(row => {
    body.push(row);
  });

  // Add some space before size summary
  body.push([{ text: ' ', colSpan: 2 }, {}]);

  // Header row for size summary
  body.push([{ text: 'Resumen de Tallas', style: 'tableHeader', colSpan: 2, alignment: 'center' }, {}]);

  // Size summary header
  body.push(['Talla', 'Cantidad']);

  // Size summary rows
  sizeSummary.forEach(item => {
    body.push([item.size, item.quantity.toString()]);
  });

  // Total row
  body.push([{ text: 'Total', bold: true }, totalQuantity.toString()]);

  const docDefinition = {
    content: [
      { text: 'Reporte de Orden de Producción', style: 'header' },
      {
        style: 'tableExample',
        table: {
          widths: ['*', '*'],
          body: body
        },
        layout: {
          fillColor: function (rowIndex: number) {
            return (rowIndex === 0 || rowIndex === productDetails.length + 2) ? '#CCCCCC' : null;
          }
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        marginBottom: 15,
        alignment: 'center' as 'center'
      },
      tableExample: {
        margin: [0, 5, 0, 15] as [number, number, number, number]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
      }
    }
  };

  pdfMake.createPdf(docDefinition).download(`Reporte_OP_${product.op}.pdf`);
}
