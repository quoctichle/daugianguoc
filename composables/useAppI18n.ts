type Locale = 'vi' | 'en'

type MessageValue = string | { [key: string]: MessageValue }
type Dictionary = Record<string, MessageValue>

const messages: Record<Locale, Dictionary> = {
  vi: {
    common: {
      brandName: 'Sự Kiện Sunshine Telecom',
      admin: 'Quản trị viên',
      logout: 'Đăng xuất',
      refresh: 'Làm mới',
      loading: 'Đang tải...',
      footerDesc: 'Nền tảng sự kiện hàng đầu, mang đến cơ hội sở hữu các sản phẩm công nghệ cao cấp với mức giá không tưởng. Minh bạch, công bằng và đầy kịch tính.',
      japanOffice: 'Trụ sở Nhật Bản',
      japanTax: 'MST: 9030001136641<br>Cấp ngày: 28/05/2020 bởi Cơ quan thuế quốc gia',
      vietnamOffice: 'Văn phòng Việt Nam',
      vietnamAddress: 'Số 29 ngõ 151B Thái Hà, phường Đống Đa, Thành phố Hà Nội',
      vietnamTax: 'MST: 0110257142<br>Cấp ngày: 20/02/2023 bởi Sở KH&ĐT TP. Hà Nội',
      loggedInAs: 'Đăng nhập với',
      close: 'Đóng cửa sổ'
    },
    auth: {
      email: 'Email',
      login: 'Đăng nhập',
      loginFailed: 'Đăng nhập thất bại.',
      adminLoginFailed: 'Đăng nhập quản trị thất bại.',
      userLoginTitle: 'Đăng nhập người dùng',
      userLoginSubtitle: 'Chỉ cần nhập Gmail để tham gia đấu giá.',
      adminLoginTitle: 'Đăng nhập quản trị',
      adminLoginSubtitle: 'Chỉ tài khoản quản trị mới được truy cập bảng điều khiển.',
      password: 'Mật khẩu',
      adminLoginButton: 'Đăng nhập quản trị',
      backToUserLogin: 'Quay về đăng nhập người dùng',
      adminLoginLink: 'Đăng nhập quản trị'
    },
    user: {
      pageTitle: 'Trang Sự Kiện',
      noRules: 'Chưa có thể lệ được công bố.',
      listTitle: 'Danh sách sản phẩm sự kiện',
      activeCount: 'Đang diễn ra: {count}',
      completedCount: 'Đã kết thúc: {count}',
      noProducts: 'Chưa có sản phẩm sự kiện.',
      prevPage: 'Trang trước',
      nextPage: 'Trang sau',
      pageOf: 'Trang {page}/{total}',
      verifyIdTitle: 'Xác thực ID khách hàng',
      verifyIdDesc: 'Sản phẩm {name} yêu cầu ID khách hàng.',
      idInputLabel: 'Nhập ID',
      idInputPlaceholder: 'Nhập ID khách hàng của bạn',
      idInvalid: 'ID không hợp lệ. Vui lòng nhập chính xác ID khách hàng của bạn',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      heroTitle: 'Sự Kiện',
      heroHighlight: 'Sunshine Telecom',
      heroSubtitle: 'Bùng nổ ưu đãi, rinh ngay quà khủng cùng',
      heroPrice: 'Sunshine',
      heroAction: 'Tham gia ngay',
      exploreNow: 'Khám phá ngay',
      learnRules: 'Tìm hiểu thể lệ',
      listSubtitle: 'Những sản phẩm công nghệ đỉnh cao đang chờ bạn',
      emptyStateTitle: 'Chưa có sự kiện nào',
      emptyStateDesc: 'Hiện tại chưa có sản phẩm nào trong sự kiện. Vui lòng quay lại sau!',
      noProductsTitle: 'Chưa có sự kiện nào',
      verifyIdSubtitle: 'Vui lòng nhập ID khách hàng để tiếp tục',
      ongoingEvents: 'Các sự kiện đang diễn ra'
    },
    auction: {
      backToList: 'Quay lại danh sách',
      verifyTitle: 'Xác thực ID khách hàng để tham gia',
      verifySubtitle: 'Sản phẩm này dành cho khách đã sử dụng, vui lòng nhập ID khách hàng.',
      verifyButton: 'Xác nhận ID',
      bidSuccess: 'Đặt giá thành công.',
      bidFailed: 'Không thể đặt giá.',
      status: {
        active: 'Đang diễn ra',
        pending: 'Sắp diễn ra',
        completed: 'Đã kết thúc'
      },
      noImage: 'Chưa có hình ảnh',
      actionNow: 'Tham gia ngay',
      actionView: 'Xem chi tiết sự kiện',
      usedTurns: 'Lượt đã dùng: {used} / {max}',
      bidPlaceholder: 'Nhập giá (¥)',
      placeBid: 'Đặt giá',
      countdownStartsIn: 'Bắt đầu sau {minutes}m {seconds}s',
      countdownRemaining: 'Còn {minutes}m {seconds}s',
      countdownEnded: 'Đã kết thúc',
      playersTitle: 'Danh sách người chơi',
      playersCount: '{count} người',
      hidePriceHint: 'Sự kiện đang diễn ra: tạm ẩn giá của tất cả người chơi.',
      winner: 'Người chiến thắng',
      player: 'Người chơi',
      noParticipants: 'Chưa có người tham gia.',
      winnerFirstHint: 'Người chiến thắng được hiển thị ở đầu danh sách.',
      revealAfterEnd: 'Khi kết thúc sự kiện, giá của từng người sẽ được hiển thị.',
      popupTitle: '🎉 Chúc mừng người chiến thắng!',
      popupSubtitle: 'Sự kiện đã kết thúc. Kết quả người thắng như sau:',
      popupNoWinner: 'Sự kiện đã kết thúc nhưng chưa có người chiến thắng.',
      statusLabel: 'Trạng thái',
      winnerLabel: 'Người chiến thắng',
      priceLabel: 'Mức giá'
    },
    admin: {
      loggedIn: 'Đăng nhập',
      rulesTitle: 'Quản lý thể lệ',
      rulesPlaceholder: 'Nhập nội dung thể lệ',
      saveRules: 'Lưu thể lệ',
      rulesSaved: 'Đã lưu thể lệ.',
      auctionsTitle: 'Thông tin chi tiết sự kiện',
      product: 'Sản phẩm',
      status: 'Trạng thái',
      totalBids: 'Tổng lượt tham gia',
      participants: 'Người tham gia',
      actions: 'Hành động',
      viewDetails: 'Xem chi tiết',
      auctionDetailTitle: 'Chi tiết sự kiện',
      finalizeWinner: 'Chốt người thắng',
      loadingDetail: 'Đang tải chi tiết...'
    },
    productForm: {
      title: 'Thêm sản phẩm sự kiện',
      event: 'Sự kiện',
      selectEvent: 'Chọn sự kiện',
      noEventHint: 'Bạn cần tạo sự kiện trước khi thêm sản phẩm.',
      image: 'Ảnh sản phẩm',
      name: 'Tên sản phẩm',
      usedProduct: 'Sản phẩm cho khách đã sử dụng',
      usedProductHint: 'Tích chọn nếu sản phẩm yêu cầu nhập ID trước khi tham gia',
      startTime: 'Thời gian bắt đầu',
      duration: 'Thời gian diễn ra (phút)',
      winners: 'Số người trúng giải',
      maxBids: 'Số lượt tham gia tối đa / người dùng',
      description: 'Mô tả',
      saving: 'Đang lưu...',
      addProduct: 'Thêm sản phẩm',
      createSuccess: 'Đã thêm sản phẩm sự kiện.',
      createFailed: 'Không thể tạo sản phẩm.'
    },
    productTable: {
      name: 'Tên sản phẩm',
      type: 'Loại sản phẩm',
      start: 'Bắt đầu',
      status: 'Trạng thái',
      totalBids: 'Tổng lượt tham gia',
      createdAt: 'Tạo lúc',
      actions: 'Hành động',
      delete: 'Xóa',
      used: 'Đã sử dụng',
      new: 'Mới'
    },
    adminAuctionCard: {
      totalBids: 'Tổng lượt tham gia: {count}',
      uniqueBids: 'Mức giá duy nhất: {count}',
      minBid: 'Giá thấp nhất: {value}',
      maxBid: 'Giá cao nhất: {value}',
      amountStats: 'Các mức giá và số lần xuất hiện',
      times: '{count} lần',
      uniqueAmountList: 'Danh sách mức giá duy nhất',
      noUnique: 'Không có mức giá duy nhất.',
      winnerList: 'Danh sách người thắng',
      noWinner: 'Chưa có người thắng.',
      allBids: 'Danh sách tất cả lượt tham gia',
      user: 'Người dùng',
      customerId: 'ID khách hàng',
      price: 'Giá',
      time: 'Thời gian'
    }
  },
  en: {
    common: {
      brandName: 'Sunshine Telecom Events',
      admin: 'Admin',
      logout: 'Log out',
      refresh: 'Refresh',
      loading: 'Loading...',
      footerDesc: 'The leading event platform, bringing you the opportunity to own high-end tech products at unbelievable prices. Transparent, fair, and thrilling.',
      japanOffice: 'Japan Headquarters',
      japanTax: 'Tax Code: 9030001136641<br>Issued: 28/05/2020 by National Tax Agency',
      vietnamOffice: 'Vietnam Office',
      vietnamAddress: 'No. 29, Alley 151B Thai Ha, Dong Da District, Hanoi',
      vietnamTax: 'Tax Code: 0110257142<br>Issued: 20/02/2023 by Hanoi DPI',
      loggedInAs: 'Logged in as',
      close: 'Close window'
    },
    auth: {
      email: 'Email',
      login: 'Log in',
      loginFailed: 'Login failed.',
      adminLoginFailed: 'Admin login failed.',
      userLoginTitle: 'User Login',
      userLoginSubtitle: 'Enter your Gmail to join the event.',
      adminLoginTitle: 'Admin Login',
      adminLoginSubtitle: 'Only admin accounts can access the dashboard.',
      password: 'Password',
      adminLoginButton: 'Admin Login',
      backToUserLogin: 'Back to user login',
      adminLoginLink: 'Admin login'
    },
    user: {
      pageTitle: 'Event Page',
      noRules: 'No rules have been published yet.',
      listTitle: 'Event Item List',
      activeCount: 'Ongoing events: {count}',
      completedCount: 'Completed: {count}',
      noProducts: 'No event products available.',
      prevPage: 'Previous',
      nextPage: 'Next',
      pageOf: 'Page {page}/{total}',
      verifyIdTitle: 'Customer ID Verification',
      verifyIdDesc: 'Product {name} requires a customer ID.',
      idInputLabel: 'Enter ID',
      idInputPlaceholder: 'Enter your customer ID',
      idInvalid: 'Invalid ID. Please use format ID25011503.',
      cancel: 'Cancel',
      confirm: 'Confirm',
      heroTitle: 'Events',
      heroHighlight: 'Sunshine Telecom',
      heroSubtitle: 'Explosive deals, grab huge rewards with',
      heroPrice: 'Sunshine',
      heroAction: 'Join Now',
      exploreNow: 'Explore Now',
      learnRules: 'Learn Rules',
      listSubtitle: 'Top-tier tech products are waiting for you',
      emptyStateTitle: 'No active events',
      emptyStateDesc: 'There are currently no products up for event. Please check back later!',
      noProductsTitle: 'No active events',
      verifyIdSubtitle: 'Please enter your customer ID to continue',
      ongoingEvents: 'Ongoing Events'
    },
    auction: {
      backToList: 'Back to list',
      verifyTitle: 'Verify customer ID to enter event',
      verifySubtitle: 'This product is for existing customers. Please enter your customer ID.',
      verifyButton: 'Verify ID',
      bidSuccess: 'Bid placed successfully.',
      bidFailed: 'Unable to place bid.',
      status: {
        active: 'Ongoing',
        pending: 'Starting soon',
        completed: 'Completed'
      },
      noImage: 'No image available',
      actionNow: 'Join now',
      actionView: 'View event details',
      usedTurns: 'Used turns: {used} / {max}',
      bidPlaceholder: 'Enter bid amount (¥)',
      placeBid: 'Place Bid',
      countdownStartsIn: 'Starts in {minutes}m {seconds}s',
      countdownRemaining: '{minutes}m {seconds}s left',
      countdownEnded: 'Completed',
      playersTitle: 'Player List',
      playersCount: '{count} players',
      hidePriceHint: 'Event in progress: all bid prices are hidden.',
      winner: 'Winner',
      player: 'Player',
      noParticipants: 'No participants yet.',
      winnerFirstHint: 'Winners are shown first.',
      revealAfterEnd: 'Bid prices will be shown when event ends.',
      popupTitle: '🎉 Congratulations to the winners!',
      popupSubtitle: 'This event has ended. Winning results:',
      popupNoWinner: 'Event ended with no winner yet.',
      statusLabel: 'Status',
      winnerLabel: 'Winner',
      priceLabel: 'Price'
    },
    admin: {
      loggedIn: 'Signed in',
      rulesTitle: 'Rules Management',
      rulesPlaceholder: 'Enter rules content',
      saveRules: 'Save Rules',
      rulesSaved: 'Rules saved.',
      auctionsTitle: 'Event Details',
      product: 'Product',
      status: 'Status',
      totalBids: 'Total Bids',
      participants: 'Participants',
      actions: 'Actions',
      viewDetails: 'View Details',
      auctionDetailTitle: 'Event Detail',
      finalizeWinner: 'Finalize Winner',
      loadingDetail: 'Loading details...'
    },
    productForm: {
      title: 'Add Event Product',
      event: 'Event',
      selectEvent: 'Select event',
      noEventHint: 'Create an event before adding products.',
      image: 'Product Image',
      name: 'Product Name',
      usedProduct: 'Used-product for existing customers',
      usedProductHint: 'Check this if customer ID is required before entering event',
      startTime: 'Start Time',
      duration: 'Event Duration (minutes)',
      winners: 'Number of winners',
      maxBids: 'Max bids per user',
      description: 'Description',
      saving: 'Saving...',
      addProduct: 'Add Product',
      createSuccess: 'Event product added.',
      createFailed: 'Unable to create product.'
    },
    productTable: {
      name: 'Product Name',
      type: 'Product Type',
      start: 'Start',
      status: 'Status',
      totalBids: 'Total Bids',
      createdAt: 'Created At',
      actions: 'Actions',
      delete: 'Delete',
      used: 'Used',
      new: 'New'
    },
    adminAuctionCard: {
      totalBids: 'Total bids: {count}',
      uniqueBids: 'Unique bids: {count}',
      minBid: 'Lowest bid: {value}',
      maxBid: 'Highest bid: {value}',
      amountStats: 'Bid amounts and frequencies',
      times: '{count} times',
      uniqueAmountList: 'Unique amount list',
      noUnique: 'No unique bids.',
      winnerList: 'Winner list',
      noWinner: 'No winner yet.',
      allBids: 'All bids',
      user: 'User',
      customerId: 'Customer ID',
      price: 'Price',
      time: 'Time'
    }
  }
}

const getByPath = (obj: Dictionary, path: string): string | undefined => {
  return path.split('.').reduce<any>((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj)
}

const interpolate = (text: string, params?: Record<string, string | number>) => {
  if (!params) {
    return text
  }

  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`))
}

export const useAppI18n = () => {
  const locale = useState<Locale>('app-locale', () => 'vi')
  const initialized = useState<boolean>('app-locale-initialized', () => false)

  if (import.meta.client && !initialized.value) {
    const saved = localStorage.getItem('site-language')
    locale.value = saved === 'en' ? 'en' : 'vi'
    initialized.value = true
  }

  const setLocale = (nextLocale: Locale) => {
    locale.value = nextLocale
    if (import.meta.client) {
      localStorage.setItem('site-language', nextLocale)
    }
  }

  const t = (key: string, params?: Record<string, string | number>) => {
    const selected = messages[locale.value] || messages.vi
    const value = getByPath(selected, key)
    if (!value || typeof value !== 'string') {
      return key
    }

    return interpolate(value, params)
  }

  return {
    locale,
    setLocale,
    t
  }
}
