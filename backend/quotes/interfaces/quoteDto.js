class QuoteDTO {
    constructor({
        clientId,
        userId,
        quoteNumber,
        title,
        description,
        subtotal,
        discountPercentage = 0,
        discountAmount = 0,
        taxPercentage = 18,
        taxAmount,
        totalAmount,
        currency = 'PEN',
        exchangeRate = 1,
        validUntil,
        status = 'draft',
        notes,
        internalNotes,
        revision = 1,
        projectName,
        pdfGenerated = false,
        pdfUrl
    }) {
        this.clientId = clientId;
        this.userId = userId;
        this.quoteNumber = quoteNumber;
        this.title = title;
        this.description = description;
        this.subtotal = subtotal;
        this.discountPercentage = discountPercentage;
        this.discountAmount = discountAmount;
        this.taxPercentage = taxPercentage;
        this.taxAmount = taxAmount;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.exchangeRate = exchangeRate;
        this.validUntil = validUntil;
        this.status = status;
        this.notes = notes;
        this.internalNotes = internalNotes;
        this.revision = revision;
        this.projectName = projectName;
        this.pdfGenerated = pdfGenerated;
        this.pdfUrl = pdfUrl;
    }
}

class QuoteUpdateDTO {
    constructor({
        title,
        description,
        discountPercentage,
        discountAmount,
        taxPercentage,
        currency,
        exchangeRate,
        validUntil,
        status,
        notes,
        internalNotes,
        projectName,
        pdfGenerated,
        pdfUrl
    }) {
        this.title = title;
        this.description = description;
        this.discountPercentage = discountPercentage;
        this.discountAmount = discountAmount;
        this.taxPercentage = taxPercentage;
        this.currency = currency;
        this.exchangeRate = exchangeRate;
        this.validUntil = validUntil;
        this.status = status;
        this.notes = notes;
        this.internalNotes = internalNotes;
        this.projectName = projectName;
        this.pdfGenerated = pdfGenerated;
        this.pdfUrl = pdfUrl;
    }
}

class QuoteItemDTO {
    constructor({
        quoteId,
        productId,
        productName,
        productDescription,
        quantity,
        unitPrice,
        discountPercentage = 0,
        discountAmount = 0,
        subtotal,
        notes,
        sortOrder = 0
    }) {
        this.quoteId = quoteId;
        this.productId = productId;
        this.productName = productName;
        this.productDescription = productDescription;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.discountPercentage = discountPercentage;
        this.discountAmount = discountAmount;
        this.subtotal = subtotal;
        this.notes = notes;
        this.sortOrder = sortOrder;
    }
}

class QuoteItemUpdateDTO {
    constructor({
        productName,
        productDescription,
        quantity,
        unitPrice,
        discountPercentage,
        discountAmount,
        notes,
        sortOrder
    }) {
        this.productName = productName;
        this.productDescription = productDescription;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.discountPercentage = discountPercentage;
        this.discountAmount = discountAmount;
        this.notes = notes;
        this.sortOrder = sortOrder;
    }
}

module.exports = { 
    QuoteDTO, 
    QuoteUpdateDTO, 
    QuoteItemDTO, 
    QuoteItemUpdateDTO 
};