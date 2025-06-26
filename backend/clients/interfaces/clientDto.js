class ClientDTO {
    constructor({
        documentType,
        documentNumber,
        clientType,
        businessName,
        firstName,
        lastName,
        email,
        phone,
        address,
        district,
        province,
        department,
        postalCode,
        creditLimit,
        paymentTerms,
        contactMethod,
        contactPreference,
        industry,
        companySize,
        website,
        notes,
        status = 'active'
    }) {
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.clientType = clientType;
        this.businessName = businessName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.district = district;
        this.province = province;
        this.department = department;
        this.postalCode = postalCode;
        this.creditLimit = creditLimit;
        this.paymentTerms = paymentTerms;
        this.contactMethod = contactMethod;
        this.contactPreference = contactPreference;
        this.industry = industry;
        this.companySize = companySize;
        this.website = website;
        this.notes = notes;
        this.status = status;
    }
}

class ClientUpdateDTO {
    constructor({
        businessName,
        firstName,
        lastName,
        email,
        phone,
        address,
        district,
        province,
        department,
        postalCode,
        creditLimit,
        paymentTerms,
        contactMethod,
        contactPreference,
        industry,
        companySize,
        website,
        notes,
        status
    }) {
        this.businessName = businessName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.district = district;
        this.province = province;
        this.department = department;
        this.postalCode = postalCode;
        this.creditLimit = creditLimit;
        this.paymentTerms = paymentTerms;
        this.contactMethod = contactMethod;
        this.contactPreference = contactPreference;
        this.industry = industry;
        this.companySize = companySize;
        this.website = website;
        this.notes = notes;
        this.status = status;
    }
}

module.exports = { ClientDTO, ClientUpdateDTO };