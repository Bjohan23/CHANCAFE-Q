const quoteRepository = require('../repository/quoteRepository');
const { QuoteDTO, QuoteUpdateDTO, QuoteItemDTO, QuoteItemUpdateDTO } = require('../interfaces/quoteDto');

class QuoteService {

  async createQuote(quoteData) {
    try {
      const {
        clientId,
        client_id,
        userId,
        user_id,
        title,
        description,
        items = [],
        quote_items = [],
        discountPercentage = 0,
        discount_percentage = 0,
        discountAmount = 0,
        discount_amount = 0,
        taxPercentage = 18,
        tax_percentage = 18,
        currency = 'PEN',
        exchangeRate = 1,
        exchange_rate = 1,
        validUntil,
        valid_until,
        notes,
        internalNotes,
        internal_notes,
        projectName,
        project_name
      } = quoteData;

      const finalClientId = clientId || client_id;
      const finalUserId = userId || user_id;
      const finalItems = items.length > 0 ? items : quote_items;
      const finalDiscountPercentage = discountPercentage || discount_percentage;
      const finalDiscountAmount = discountAmount || discount_amount;
      const finalTaxPercentage = taxPercentage || tax_percentage;
      const finalExchangeRate = exchangeRate || exchange_rate;
      const finalValidUntil = validUntil || valid_until;
      const finalInternalNotes = internalNotes || internal_notes;
      const finalProjectName = projectName || project_name;

      if (!finalClientId || !finalUserId) {
        throw new Error("Cliente y usuario son obligatorios");
      }

      if (!title) {
        throw new Error("El título de la cotización es obligatorio");
      }

      if (finalItems.length === 0) {
        throw new Error("La cotización debe tener al menos un item");
      }

      const quoteNumber = await quoteRepository.generateQuoteNumber();

      let subtotal = 0;
      for (const item of finalItems) {
        if (!item.quantity || item.quantity <= 0) {
          throw new Error("La cantidad debe ser mayor a 0");
        }
        if (!item.unitPrice && !item.unit_price) {
          throw new Error("El precio unitario es obligatorio");
        }
        
        const unitPrice = item.unitPrice || item.unit_price;
        const discountPercentage = item.discountPercentage || item.discount || 0;
        const itemDiscountAmount = item.discountAmount || (unitPrice * item.quantity * discountPercentage / 100);
        const itemSubtotal = (unitPrice * item.quantity) - itemDiscountAmount;
        subtotal += itemSubtotal;
      }

      const calculatedDiscountAmount = finalDiscountAmount || (subtotal * finalDiscountPercentage / 100);
      const subtotalAfterDiscount = subtotal - calculatedDiscountAmount;
      const taxAmount = subtotalAfterDiscount * finalTaxPercentage / 100;
      const totalAmount = subtotalAfterDiscount + taxAmount;

      const quoteDto = new QuoteDTO({
        clientId: finalClientId,
        userId: finalUserId,
        quoteNumber,
        title,
        description,
        subtotal,
        discountPercentage: finalDiscountPercentage,
        discountAmount: calculatedDiscountAmount,
        taxPercentage: finalTaxPercentage,
        taxAmount,
        totalAmount,
        currency,
        exchangeRate: finalExchangeRate,
        validUntil: finalValidUntil,
        status: quoteData.status || 'draft',
        notes,
        internalNotes: finalInternalNotes,
        revision: 1,
        projectName: finalProjectName,
        pdfGenerated: false
      });

      const newQuote = await quoteRepository.create({
        client_id: finalClientId,
        user_id: quoteDto.userId,
        quote_number: quoteDto.quoteNumber,
        title: quoteDto.title,
        description: quoteDto.description,
        subtotal: quoteDto.subtotal,
        discount_percentage: quoteDto.discountPercentage,
        discount_amount: quoteDto.discountAmount,
        tax_percentage: quoteDto.taxPercentage,
        tax_amount: quoteDto.taxAmount,
        total_amount: quoteDto.totalAmount,
        currency: quoteDto.currency,
        exchange_rate: quoteDto.exchangeRate,
        valid_until: quoteDto.validUntil,
        status: quoteDto.status,
        notes: quoteDto.notes,
        internal_notes: quoteDto.internalNotes,
        revision: quoteDto.revision,
        project_name: quoteDto.projectName,
        pdf_generated: quoteDto.pdfGenerated
      });

      for (let i = 0; i < finalItems.length; i++) {
        const item = finalItems[i];
        const unitPrice = item.unitPrice || item.unit_price;
        const discountPercentage = item.discountPercentage || item.discount || 0;
        const itemDiscountAmount = item.discountAmount || (unitPrice * item.quantity * discountPercentage / 100);
        const itemSubtotal = (unitPrice * item.quantity) - itemDiscountAmount;

        const itemDto = new QuoteItemDTO({
          quoteId: newQuote.id,
          productId: item.productId || item.product_id,
          productName: item.productName || item.product_name,
          productDescription: item.productDescription || item.description,
          quantity: item.quantity,
          unitPrice: unitPrice,
          discountPercentage: discountPercentage,
          discountAmount: itemDiscountAmount,
          subtotal: itemSubtotal,
          notes: item.notes,
          sortOrder: i + 1
        });

        await quoteRepository.createItem({
          quote_id: itemDto.quoteId,
          product_id: itemDto.productId,
          product_name: itemDto.productName,
          product_description: itemDto.productDescription,
          quantity: itemDto.quantity,
          unit_price: itemDto.unitPrice,
          discount_percentage: itemDto.discountPercentage,
          discount_amount: itemDto.discountAmount,
          subtotal: itemDto.subtotal,
          notes: itemDto.notes,
          sort_order: itemDto.sortOrder
        });
      }

      const quoteWithItems = await this.getQuoteWithItems(newQuote.id);
      
      return {
        quote: quoteWithItems,
        message: "Cotización creada exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en QuoteService.createQuote:', error.message);
      throw error;
    }
  }

  async getQuoteById(id) {
    try {
      const quote = await quoteRepository.findById(id);
      if (!quote) {
        throw new Error("Cotización no encontrada");
      }
      return this.formatQuoteResponse(quote);
    } catch (error) {
      console.error('❌ Error en QuoteService.getQuoteById:', error.message);
      throw error;
    }
  }

  async getQuoteByNumber(quoteNumber) {
    try {
      const quote = await quoteRepository.findByQuoteNumber(quoteNumber);
      if (!quote) {
        throw new Error("Cotización no encontrada");
      }
      return this.formatQuoteResponse(quote);
    } catch (error) {
      console.error('❌ Error en QuoteService.getQuoteByNumber:', error.message);
      throw error;
    }
  }

  async getQuoteWithItems(id) {
    try {
      const quote = await quoteRepository.findById(id);
      if (!quote) {
        throw new Error("Cotización no encontrada");
      }

      const items = await quoteRepository.findItemsByQuote(id);
      const formattedQuote = this.formatQuoteResponse(quote);
      formattedQuote.items = items.map(item => this.formatQuoteItemResponse(item));

      return formattedQuote;
    } catch (error) {
      console.error('❌ Error en QuoteService.getQuoteWithItems:', error.message);
      throw error;
    }
  }

  async getAllQuotes(filters = {}, pagination = {}) {
    try {
      if (pagination.page && pagination.limit) {
        const result = await quoteRepository.findAndCountAll(filters, pagination);
        return {
          quotes: result.quotes.map(quote => this.formatQuoteResponse(quote)),
          pagination: {
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            pageSize: result.pageSize
          }
        };
      } else {
        const quotes = await quoteRepository.findAll(filters);
        return quotes.map(quote => this.formatQuoteResponse(quote));
      }
    } catch (error) {
      console.error('❌ Error en QuoteService.getAllQuotes:', error.message);
      throw error;
    }
  }

  async getQuotesByStatus(status) {
    try {
      const quotes = await quoteRepository.findByStatus(status);
      return quotes.map(quote => this.formatQuoteResponse(quote));
    } catch (error) {
      console.error('❌ Error en QuoteService.getQuotesByStatus:', error.message);
      throw error;
    }
  }

  async getQuotesByClient(clientId) {
    try {
      const quotes = await quoteRepository.findByClient(clientId);
      return quotes.map(quote => this.formatQuoteResponse(quote));
    } catch (error) {
      console.error('❌ Error en QuoteService.getQuotesByClient:', error.message);
      throw error;
    }
  }

  async getQuotesByUser(userId) {
    try {
      const quotes = await quoteRepository.findByUser(userId);
      return quotes.map(quote => this.formatQuoteResponse(quote));
    } catch (error) {
      console.error('❌ Error en QuoteService.getQuotesByUser:', error.message);
      throw error;
    }
  }

  async updateQuote(id, updateData) {
    try {
      const existingQuote = await quoteRepository.findById(id);
      if (!existingQuote) {
        throw new Error("Cotización no encontrada");
      }

      if (existingQuote.status === 'approved' || existingQuote.status === 'converted') {
        throw new Error("No se puede modificar una cotización aprobada o convertida");
      }

      const quoteUpdateDto = new QuoteUpdateDTO(updateData);
      const updatedQuote = await quoteRepository.update(id, {
        title: quoteUpdateDto.title,
        description: quoteUpdateDto.description,
        discount_percentage: quoteUpdateDto.discountPercentage,
        discount_amount: quoteUpdateDto.discountAmount,
        tax_percentage: quoteUpdateDto.taxPercentage,
        currency: quoteUpdateDto.currency,
        exchange_rate: quoteUpdateDto.exchangeRate,
        valid_until: quoteUpdateDto.validUntil,
        status: quoteUpdateDto.status,
        notes: quoteUpdateDto.notes,
        internal_notes: quoteUpdateDto.internalNotes,
        project_name: quoteUpdateDto.projectName,
        pdf_generated: quoteUpdateDto.pdfGenerated,
        pdf_url: quoteUpdateDto.pdfUrl
      });
      
      return {
        quote: this.formatQuoteResponse(updatedQuote),
        message: "Cotización actualizada exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en QuoteService.updateQuote:', error.message);
      throw error;
    }
  }

  async changeQuoteStatus(id, status) {
    try {
      const updatedQuote = await quoteRepository.changeStatus(id, status);
      if (!updatedQuote) {
        throw new Error("Cotización no encontrada");
      }
      return {
        message: `Estado de la cotización actualizado a: ${status}`,
        quote: this.formatQuoteResponse(updatedQuote)
      };
    } catch (error) {
      console.error('❌ Error en QuoteService.changeQuoteStatus:', error.message);
      throw error;
    }
  }

  async deleteQuote(id) {
    try {
      const quote = await quoteRepository.findById(id);
      if (!quote) {
        throw new Error("Cotización no encontrada");
      }

      if (quote.status === 'approved' || quote.status === 'converted') {
        throw new Error("No se puede eliminar una cotización aprobada o convertida");
      }

      await quoteRepository.deleteItemsByQuote(id);
      
      const deleted = await quoteRepository.delete(id);
      if (!deleted) {
        throw new Error("Error al eliminar la cotización");
      }

      return {
        message: "Cotización eliminada exitosamente",
        deletedQuote: this.formatQuoteResponse(quote)
      };
    } catch (error) {
      console.error('❌ Error en QuoteService.deleteQuote:', error.message);
      throw error;
    }
  }

  async addQuoteItem(quoteId, itemData) {
    try {
      const quote = await quoteRepository.findById(quoteId);
      if (!quote) {
        throw new Error("Cotización no encontrada");
      }

      if (quote.status === 'approved' || quote.status === 'converted') {
        throw new Error("No se pueden agregar items a una cotización aprobada o convertida");
      }

      const items = await quoteRepository.findItemsByQuote(quoteId);
      const nextSortOrder = items.length + 1;

      const itemDiscountAmount = itemData.discountAmount || (itemData.unitPrice * itemData.quantity * (itemData.discountPercentage || 0) / 100);
      const itemSubtotal = (itemData.unitPrice * itemData.quantity) - itemDiscountAmount;

      const itemDto = new QuoteItemDTO({
        quoteId,
        productId: itemData.productId,
        productName: itemData.productName,
        productDescription: itemData.productDescription,
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice,
        discountPercentage: itemData.discountPercentage || 0,
        discountAmount: itemDiscountAmount,
        subtotal: itemSubtotal,
        notes: itemData.notes,
        sortOrder: nextSortOrder
      });

      const newItem = await quoteRepository.createItem({
        quote_id: itemDto.quoteId,
        product_id: itemDto.productId,
        product_name: itemDto.productName,
        product_description: itemDto.productDescription,
        quantity: itemDto.quantity,
        unit_price: itemDto.unitPrice,
        discount_percentage: itemDto.discountPercentage,
        discount_amount: itemDto.discountAmount,
        subtotal: itemDto.subtotal,
        notes: itemDto.notes,
        sort_order: itemDto.sortOrder
      });

      await this.recalculateQuoteTotals(quoteId);

      return {
        item: this.formatQuoteItemResponse(newItem),
        message: "Item agregado exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en QuoteService.addQuoteItem:', error.message);
      throw error;
    }
  }

  async updateQuoteItem(itemId, updateData) {
    try {
      const existingItem = await quoteRepository.findItemById(itemId);
      if (!existingItem) {
        throw new Error("Item no encontrado");
      }

      const quote = await quoteRepository.findById(existingItem.quote_id);
      if (quote.status === 'approved' || quote.status === 'converted') {
        throw new Error("No se pueden modificar items de una cotización aprobada o convertida");
      }

      const itemUpdateDto = new QuoteItemUpdateDTO(updateData);
      
      let updateFields = {
        product_name: itemUpdateDto.productName,
        product_description: itemUpdateDto.productDescription,
        quantity: itemUpdateDto.quantity,
        unit_price: itemUpdateDto.unitPrice,
        discount_percentage: itemUpdateDto.discountPercentage,
        discount_amount: itemUpdateDto.discountAmount,
        notes: itemUpdateDto.notes,
        sort_order: itemUpdateDto.sortOrder
      };

      if (updateFields.quantity && updateFields.unit_price) {
        const discountAmount = updateFields.discount_amount || (updateFields.unit_price * updateFields.quantity * (updateFields.discount_percentage || 0) / 100);
        updateFields.discount_amount = discountAmount;
        updateFields.subtotal = (updateFields.unit_price * updateFields.quantity) - discountAmount;
      }

      const updatedItem = await quoteRepository.updateItem(itemId, updateFields);
      
      await this.recalculateQuoteTotals(existingItem.quote_id);

      return {
        item: this.formatQuoteItemResponse(updatedItem),
        message: "Item actualizado exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en QuoteService.updateQuoteItem:', error.message);
      throw error;
    }
  }

  async deleteQuoteItem(itemId) {
    try {
      const item = await quoteRepository.findItemById(itemId);
      if (!item) {
        throw new Error("Item no encontrado");
      }

      const quote = await quoteRepository.findById(item.quote_id);
      if (quote.status === 'approved' || quote.status === 'converted') {
        throw new Error("No se pueden eliminar items de una cotización aprobada o convertida");
      }

      const deleted = await quoteRepository.deleteItem(itemId);
      if (!deleted) {
        throw new Error("Error al eliminar el item");
      }

      await this.recalculateQuoteTotals(item.quote_id);

      return {
        message: "Item eliminado exitosamente",
        deletedItem: this.formatQuoteItemResponse(item)
      };
    } catch (error) {
      console.error('❌ Error en QuoteService.deleteQuoteItem:', error.message);
      throw error;
    }
  }

  async recalculateQuoteTotals(quoteId) {
    try {
      const quote = await quoteRepository.findById(quoteId);
      const items = await quoteRepository.findItemsByQuote(quoteId);

      const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
      const discountAmount = subtotal * quote.discount_percentage / 100;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const taxAmount = subtotalAfterDiscount * quote.tax_percentage / 100;
      const totalAmount = subtotalAfterDiscount + taxAmount;

      await quoteRepository.update(quoteId, {
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount
      });

      return { subtotal, discountAmount, taxAmount, totalAmount };
    } catch (error) {
      console.error('❌ Error en QuoteService.recalculateQuoteTotals:', error.message);
      throw error;
    }
  }

  async getQuoteStats() {
    try {
      return await quoteRepository.getQuoteStats();
    } catch (error) {
      console.error('❌ Error en QuoteService.getQuoteStats:', error.message);
      throw error;
    }
  }

  async getQuoteWithRelations(id, relations = []) {
    try {
      const quote = await quoteRepository.findWithRelations(id, relations);
      if (!quote) {
        throw new Error("Cotización no encontrada");
      }
      return this.formatQuoteResponse(quote);
    } catch (error) {
      console.error('❌ Error en QuoteService.getQuoteWithRelations:', error.message);
      throw error;
    }
  }

  formatQuoteResponse(quote) {
    if (!quote) return null;

    const formattedQuote = {
      id: quote.id,
      clientId: quote.client_id,
      userId: quote.user_id,
      quoteNumber: quote.quote_number,
      title: quote.title,
      description: quote.description,
      subtotal: parseFloat(quote.subtotal) || 0,
      discountPercentage: parseFloat(quote.discount_percentage) || 0,
      discountAmount: parseFloat(quote.discount_amount) || 0,
      taxPercentage: parseFloat(quote.tax_percentage) || 0,
      taxAmount: parseFloat(quote.tax_amount) || 0,
      totalAmount: parseFloat(quote.total_amount) || 0,
      currency: quote.currency,
      exchangeRate: parseFloat(quote.exchange_rate) || 1,
      validUntil: quote.valid_until,
      status: quote.status,
      notes: quote.notes,
      internalNotes: quote.internal_notes,
      revision: quote.revision,
      projectName: quote.project_name,
      pdfGenerated: quote.pdf_generated,
      pdfUrl: quote.pdf_url,
      createdAt: quote.created_at,
      updatedAt: quote.updated_at,
      isDraft: quote.status === 'draft',
      isApproved: quote.status === 'approved',
      isExpired: quote.valid_until ? new Date(quote.valid_until) < new Date() : false
    };

    // Incluir relaciones si están disponibles
    if (quote.client) {
      formattedQuote.client = {
        id: quote.client.id,
        businessName: quote.client.business_name,
        firstName: quote.client.first_name,
        lastName: quote.client.last_name,
        email: quote.client.email,
        phone: quote.client.phone,
        documentNumber: quote.client.document_number,
        documentType: quote.client.document_type,
        taxId: quote.client.tax_id,
        clientType: quote.client.client_type,
        status: quote.client.status,
        creditScore: quote.client.credit_score,
        riskClassification: quote.client.risk_classification,
        suggestedCreditLimit: quote.client.suggested_credit_limit,
        isBanked: quote.client.is_banked
      };
    }

    if (quote.advisor) {
      formattedQuote.advisor = {
        id: quote.advisor.id,
        firstName: quote.advisor.first_name,
        lastName: quote.advisor.last_name,
        email: quote.advisor.email,
        role: quote.advisor.role
      };
    }

    // Incluir quote_items si están disponibles
    if (quote.quote_items && Array.isArray(quote.quote_items)) {
      formattedQuote.quote_items = quote.quote_items.map(item => this.formatQuoteItemResponse(item));
    }

    return formattedQuote;
  }

  formatQuoteItemResponse(item) {
    if (!item) return null;

    return {
      id: item.id,
      quoteId: item.quote_id,
      productId: item.product_id,
      productName: item.product_name,
      productDescription: item.product_description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      discountPercentage: item.discount_percentage,
      discountAmount: item.discount_amount,
      subtotal: item.subtotal,
      notes: item.notes,
      sortOrder: item.sort_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  }
}

module.exports = new QuoteService();