import { color } from 'chart.js/helpers';
import pdfMake from 'pdfmake/build/pdfmake';
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
      timeZone: 'UTC',
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
}

export function generateProductPdf(
  product: any,
  sizeSummary: { size: string; quantity: number }[],
  totalQuantity: number
) {
  const body = [];

  // Header row for product details
  body.push([
    {
      text: 'Detalle OP',
      style: 'tableHeader',
      colSpan: 2,
      alignment: 'center',
    },
    {},
  ]);

  // Product details rows
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    });
  };
  const productDetails = [
    ['OP', product.op || 'Sin OP'],
    ['Referencia', product.reference || 'Sin referencia'],
    ['Marca', product.brand || 'Sin marca'],
    ['Descripción', product.description || 'Sin descripción'],
    ['Campaña', product.campaign || 'Sin campaña'],
    ['Tipo', product.type || 'sin tipo'],
    [
      'Fecha Asignada',
      formatDateForDisplay(product.assignedDate) || 'Sin fecha',
    ],
    [
      'Fecha Entrada',
      formatDateForDisplay(product.plantEntryDate) || 'Sin fecha',
    ],
    ['Cantidad', product.quantity || '0'],
    [
      'Precio',
      product.price != null ? formatCurrency(Number(product.price)) : '0',
    ],
    [
      'Precio Total',
      product.price != null && product.quantity != null
        ? formatCurrency(Number(product.price) * Number(product.quantity))
        : '0',
    ],
    ['Estado', product.status || 'Sin estado'],
    ['Motivo de parada', product.stoppageReason || 'Sin motivo'],
    ['Ciclo', product.cycleCalculated || '0'],
    ['Cantidad confeccionada', product.quantityMade || '0'],
    ['Cantidad faltante', product.quantityPending || '0'],
    [
      '% de entrega',
      product.deliveryPercentage ? `${product.deliveryPercentage}%` : '0%',
    ],
    [
      'Fecha de entrega real',
      formatDateForDisplay(product.actualDeliveryDate) || 'Sin fecha',
    ],
    ['Equipo', product.team?.name || product.team || 'No asignado'],
    ['SAM', product.sam || '0'],
    ['SAM total', product.samTotal || '0'],
    ['Número de personas', product.numPersons || '0'],
    ['Días de carga', product.totaLoadDays || '0'],
  ];
  productDetails.forEach((row) => {
    body.push(row);
  });

  // Add some space before size summary
  body.push([{ text: ' ', colSpan: 2 }, {}]);

  // Header row for size summary
  body.push([
    {
      text: 'Resumen de Tallas',
      style: 'tableHeader',
      colSpan: 2,
      alignment: 'center',
    },
    {},
  ]);

  // Size summary header
  body.push(['Talla', 'Cantidad']);

  // Size summary rows
  sizeSummary.forEach((item) => {
    body.push([item.size, item.quantity.toString()]);
  });

  body.push([{ text: 'Total', bold: true,  color: 'blue' }, totalQuantity.toString()]);

  const docDefinition = {
    content: [
      { text: 'Reporte de Orden de Producción', style: 'header' },
      {
        style: 'tableExample',
        table: {
          widths: ['*', '*'],
          body: body,
        },
        layout: {
          hLineWidth: function () {
            return 0.5;
          },
          vLineWidth: function () {
            return 0.5;
          },

          fillColor: function (rowIndex: number) {
            return rowIndex === 0 || rowIndex === productDetails.length + 2
              ? '#CCCCCC'
              : null;
          },
        },
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        marginBottom: 15,
        alignment: 'center' as 'center',
      },
      tableExample: {
        margin: [0, 5, 0, 15] as [number, number, number, number],
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black',
      },
    },
  };

  pdfMake.createPdf(docDefinition).download(`Reporte_OP_${product.op}.pdf`);
}
