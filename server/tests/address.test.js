describe('Address Book Default Logic Business Rules Tests', () => {
  // Pure model simulator adhering to Address model logic
  class AddressBookSimulator {
    constructor() {
      this.addresses = [];
    }

    addAddress(addrData) {
      if (this.addresses.length >= 10) {
        throw new Error('Maximum limit of 10 addresses reached');
      }

      const isFirst = this.addresses.length === 0;
      const isDefault = isFirst ? true : Boolean(addrData.isDefault);

      if (isDefault) {
        // Unset previous default
        this.addresses.forEach((a) => (a.isDefault = false));
      }

      const newAddr = {
        _id: `addr_${Date.now()}_${Math.random()}`,
        ...addrData,
        isDefault,
      };

      this.addresses.push(newAddr);
      return newAddr;
    }

    setDefault(addressId) {
      const target = this.addresses.find((a) => a._id === addressId);
      if (!target) throw new Error('Address not found');

      this.addresses.forEach((a) => (a.isDefault = a._id === addressId));
      return target;
    }

    deleteAddress(addressId) {
      const targetIndex = this.addresses.findIndex((a) => a._id === addressId);
      if (targetIndex === -1) throw new Error('Address not found');

      const wasDefault = this.addresses[targetIndex].isDefault;
      this.addresses.splice(targetIndex, 1);

      // If deleted address was default and others remain, auto-promote first remaining address to default
      if (wasDefault && this.addresses.length > 0) {
        this.addresses[0].isDefault = true;
      }
    }

    getDefaultAddress() {
      return this.addresses.find((a) => a.isDefault) || null;
    }
  }

  test('first address created is automatically marked as default', () => {
    const book = new AddressBookSimulator();
    const addr1 = book.addAddress({
      fullName: 'Rahul Sharma',
      addressLine1: 'Flat 402, Lotus Apts',
      city: 'Nashik',
      state: 'Maharashtra',
      pincode: '422001',
    });

    expect(addr1.isDefault).toBe(true);
    expect(book.getDefaultAddress()?._id).toBe(addr1._id);
  });

  test('setting a second address as default automatically unsets the previous default', () => {
    const book = new AddressBookSimulator();
    const addr1 = book.addAddress({
      fullName: 'Rahul Sharma',
      addressLine1: 'Flat 402, Lotus Apts',
      city: 'Nashik',
      state: 'Maharashtra',
      pincode: '422001',
    });

    const addr2 = book.addAddress({
      fullName: 'Rahul Office',
      addressLine1: 'Cyber Tech Park',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      isDefault: true,
    });

    expect(addr2.isDefault).toBe(true);
    expect(addr1.isDefault).toBe(false);
    expect(book.getDefaultAddress()?._id).toBe(addr2._id);
  });

  test('deleting current default promotes remaining address so user is never left with zero defaults', () => {
    const book = new AddressBookSimulator();
    const addr1 = book.addAddress({
      fullName: 'Home',
      addressLine1: 'Street 1',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    });

    const addr2 = book.addAddress({
      fullName: 'Work',
      addressLine1: 'Street 2',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      isDefault: true,
    });

    expect(book.getDefaultAddress()?._id).toBe(addr2._id);

    // Delete current default addr2
    book.deleteAddress(addr2._id);

    // Verify addr1 is now auto-promoted to default
    expect(book.addresses.length).toBe(1);
    expect(book.addresses[0].isDefault).toBe(true);
    expect(book.getDefaultAddress()?._id).toBe(addr1._id);
  });

  test('enforces maximum 10 addresses limit per user account', () => {
    const book = new AddressBookSimulator();
    for (let i = 0; i < 10; i++) {
      book.addAddress({
        fullName: `Address ${i + 1}`,
        addressLine1: `Line ${i + 1}`,
        city: 'City',
        state: 'State',
        pincode: '400001',
      });
    }

    expect(book.addresses.length).toBe(10);
    expect(() => {
      book.addAddress({
        fullName: 'Address 11',
        addressLine1: 'Line 11',
        city: 'City',
        state: 'State',
        pincode: '400001',
      });
    }).toThrow('Maximum limit of 10 addresses reached');
  });
});
