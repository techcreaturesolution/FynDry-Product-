import { create } from 'zustand';

export const useUiStore = create((set) => ({
  // Mobile navigation drawer
  isMobileMenuOpen: false,
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Global search modal
  isSearchModalOpen: false,
  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),
  toggleSearchModal: () => set((state) => ({ isSearchModalOpen: !state.isSearchModalOpen })),

  // Address modal
  isAddressModalOpen: false,
  editingAddress: null,
  openAddressModal: (address = null) => set({ isAddressModalOpen: true, editingAddress: address }),
  closeAddressModal: () => set({ isAddressModalOpen: false, editingAddress: null }),

  // Generic dynamic modal state
  activeModal: null,
  modalData: null,
  openModal: (modalName, data = null) => set({ activeModal: modalName, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));

export default useUiStore;
