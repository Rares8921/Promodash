import { Component, OnInit } from '@angular/core';
import { CardService } from 'src/app/services/card.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';
import { PromoCodeService } from '../../services/promo-code.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  [key: string]: any;
  showCharts = false;  

  showUsers = false;
  showRequests = false;
  showClicks = false;
  showWithdrawals = false;
  showBackupMenu = false;
  showPromoModal = false;

  users: any[] = []; 
  requests: any[] = [];
  clicks: any[] = [];
  withdrawals: any[] = [];
  promoCodes: any[] = [];

  totalUsers = 0;
  totalRequests = 0;
  totalClicks = 0;
  totalWithdrawals = 0;
  totalPromoCodes = 0;
  loading = true;

  selectedPeriod = 30;
  growthStats: { [key: string]: number } = {};

  clickChartData: any = { labels: [], datasets: [] };
  salesChartData: any = { labels: [], datasets: [] };
  withdrawalChartData: any = { labels: [], datasets: [] };

  currentPage: Record<'users' | 'requests' | 'clicks' | 'withdrawals' | 'promoCodes', number> = {
    users: 1,
    requests: 1,
    clicks: 1,
    withdrawals: 1,
    promoCodes: 1
  };
  
  pageSize = 50;
  pageSizeOptions = [25, 50, 75, 100];

  searchQuery: Record<'users' | 'requests' | 'clicks' | 'withdrawals' | 'promoCodes', string> = {
    users: '',
    requests: '',
    clicks: '',
    withdrawals: '',
    promoCodes: ''
  };

  paginatedUsers: any[] = [];
  paginatedRequests: any[] = [];
  paginatedClicks: any[] = [];
  paginatedWithdrawals: any[] = [];
  paginatedPromoCodes: any[] = [];

  isAdmin = true;

  newPromo = {
    code: '',
    percentageBoost: 0,
    expirationDateDate: '',
    expirationDateTime: '',
    maxUses: 0,
    uses: 0
  };

  constructor(private cardService: CardService, private router: Router, private promoCodeService: PromoCodeService) {
  }

  async ngOnInit(): Promise<void> {
    try {
      this.loading = true;
      await this.cardService.signIn(); // admin

      this.users = await this.cardService.getAllUsers();
      this.totalUsers = this.users.length;

      this.requests = await this.cardService.getRequests();
      this.totalRequests = this.requests.length;      

      this.clicks = await this.cardService.getClicks();
      this.totalClicks = this.clicks.length;

      this.withdrawals = await this.cardService.getWithdrawals(); 
      this.totalWithdrawals = this.withdrawals.length;

      this.promoCodes = await this.promoCodeService.getAllPromoCodes();
      this.totalPromoCodes = this.promoCodes.length;

      this.updatePaginatedData('users');
      this.updatePaginatedData('requests');
      this.updatePaginatedData('clicks');
      this.updatePaginatedData('withdrawals');      
      this.updatePaginatedData('promoCodes');

      await this.loadAllCharts();

    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  goToUserDetail(userId: string) {
    this.router.navigate(['/user-detail', userId]);
  }

  goToRequestDetail(id: string) {
    this.router.navigate(['/request-detail', id]);
  }

  goToClickDetail(clickId: string) {
    this.router.navigate(['/clicks', clickId]);
  }  
  
  goToWithdrawalDetail(withdrawalId: string) {
    this.router.navigate(['/withdrawal', withdrawalId]);
  }

  goToPromoDetail(id: string) {
    this.router.navigate(['/promo-detail', id]);
  }

  toggleScene(scene: 'charts' | 'info') {
    this.showCharts = scene === 'charts';
  }

  toggleTable(section: string) {
    if (section === 'users') this.showUsers = !this.showUsers;
    if (section === 'requests') this.showRequests = !this.showRequests;
    if (section === 'clicks') this.showClicks = !this.showClicks;
    if (section === 'withdrawals') this.showWithdrawals = !this.showWithdrawals;
    if (section === 'promoCodes') this.showPromoCodes = !this.showPromoCodes;
  }

  openCreatePromoModal() {
    this.showPromoModal = true;
  }

  closePromoModal() {
    this.showPromoModal = false;
  }

  async submitPromoCode(form: any) {
    if (!form.valid) return;

    const fullDateTime = new Date(`${this.newPromo.expirationDateDate}T${this.newPromo.expirationDateTime}:00Z`);
    const dataToSubmit = {
      code: this.newPromo.code.trim(),
      percentageBoost: this.newPromo.percentageBoost,
      expirationDate: fullDateTime.toISOString(),
      maxUses: this.newPromo.maxUses,
      uses: 0
    };

    try {
      await this.promoCodeService.createPromoCode(dataToSubmit);
      this.displayNotification('Promo code created successfully.');
      this.closePromoModal();
      this.promoCodes = await this.promoCodeService.getAllPromoCodes();
      this.totalPromoCodes = this.promoCodes.length;
      this.updatePaginatedData('promoCodes');
    } catch (err) {
      console.error(err);
      this.displayNotification('Failed to create promo code.');
    }
  }
  
  changePage(section: 'users' | 'requests' | 'clicks' | 'withdrawals' | 'promoCodes', direction: 'next' | 'prev') {
    const maxPage = this.getMaxPage(section)

    if (direction === 'next' && this.currentPage[section] < maxPage) {
      this.currentPage[section]++;
      this.updatePaginatedData(section);
    } else if (direction === 'prev' && this.currentPage[section] > 1) {
      this.currentPage[section]--;
      this.updatePaginatedData(section);
    }
  }

  getMaxPage(section: 'users' | 'requests' | 'clicks' | 'withdrawals' | 'promoCodes'): number {
    const totalItems = this[section].length;
    return Math.ceil(totalItems / this.pageSize);
  }
  
  onSearch(section: 'users' | 'requests' | 'clicks' | 'withdrawals' | 'promoCodes', value: string) {
    this.searchQuery[section] = value.toLowerCase();
    this.currentPage[section] = 1;
    this.updatePaginatedData(section);
  }

  setPageSizeFromEvent(event: Event) {
    const value = +(event.target as HTMLSelectElement).value;
    this.setPageSize(value);
  }

  setPageSize(newSize: number) {
    if (newSize >= 25 && newSize <= 100) {
      this.pageSize = newSize;
      this.updatePaginatedData('users');
      this.updatePaginatedData('requests');
      this.updatePaginatedData('clicks');
      this.updatePaginatedData('withdrawals');
      this.updatePaginatedData('promoCodes');
    }
  }  

  updatePaginatedData(section: 'users' | 'requests' | 'clicks' | 'withdrawals' | 'promoCodes') {
    let data = this[section];
    const query = this.searchQuery[section];
    const filtered = data.filter((item: any) =>
      Object.values(item).some(val => val !== undefined && val !== null && String(val).toLowerCase().includes(query))
    );
  
    const start = (this.currentPage[section] - 1) * this.pageSize;
    const end = start + this.pageSize;
  
    if (section === 'users') this.paginatedUsers = filtered.slice(start, end);
    if (section === 'requests') this.paginatedRequests = filtered.slice(start, end);
    if (section === 'clicks') this.paginatedClicks = filtered.slice(start, end);
    if (section === 'withdrawals') this.paginatedWithdrawals = filtered.slice(start, end);
    if (section === 'promoCodes') this.paginatedPromoCodes = filtered.slice(start, end);
  }
    
  getInputValue(event: Event): string {
    const target = event.target as HTMLInputElement;
    return target?.value || '';
  }

  async loadAllCharts() {
    await this.loadChart('click');
    await this.loadChart('sales');
    await this.loadChart('withdrawal');
  }

  async loadChart(type: 'click' | 'sales' | 'withdrawal') {
    let rawData = [];
    if (type === 'click') rawData = await this.cardService.getClickStats();
    if (type === 'sales') rawData = await this.cardService.getCommissionStats();
    if (type === 'withdrawal') rawData = await this.cardService.getWithdrawalStats();

    const filtered = rawData.filter((item: { date: string | number | Date; }) =>
      new Date(item.date) >= this.getStartDate(this.selectedPeriod)
    );

    const grouped = type === 'click'
      ? this.groupByDate(filtered.map((c: { date: any; }) => c.date))
      : this.groupSumByDate(filtered);

    const prevPeriod = rawData.filter((item: { date: string | number | Date; }) =>
      new Date(item.date) >= this.getStartDate(this.selectedPeriod * 2) &&
      new Date(item.date) < this.getStartDate(this.selectedPeriod)
    );

    const prevGrouped = type === 'click'
      ? this.groupByDate(prevPeriod.map((c: { date: any; }) => c.date))
      : this.groupSumByDate(prevPeriod);

    const currentSum = Object.values(grouped).reduce((a, b) => a + b, 0);
    const prevSum = Object.values(prevGrouped).reduce((a, b) => a + b, 0);

    this.growthStats[type] = prevSum === 0 ? 0 : ((currentSum - prevSum) / prevSum) * 100;

    const chartData = {
      labels: Object.keys(grouped),
      datasets: [{
        data: Object.values(grouped),
        label: type === 'click' ? 'Clicks' : type === 'sales' ? 'Sales (RON)' : 'Withdrawals (RON)',
        fill: true,
        borderColor: type === 'click' ? '#26c6da' : type === 'sales' ? '#4bc0c0' : '#ff6384',
        backgroundColor: type === 'click' ? 'rgba(38, 198, 218, 0.2)' :
                          type === 'sales' ? 'rgba(75, 192, 192, 0.2)' :
                                             'rgba(255, 99, 132, 0.2)'
      }]
    };

    if (type === 'click') this.clickChartData = chartData;
    if (type === 'sales') this.salesChartData = chartData;
    if (type === 'withdrawal') this.withdrawalChartData = chartData;
  }

  getStartDate(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  groupByDate(dates: string[]) {
    const counts: { [date: string]: number } = {};
    dates.forEach(d => {
      const day = new Date(d).toISOString().split('T')[0];
      counts[day] = (counts[day] || 0) + 1;
    });
    return counts;
  }

  groupSumByDate(items: { amount: number, date: string }[]) {
    const sums: { [date: string]: number } = {};
    items.forEach(i => {
      const day = new Date(i.date).toISOString().split('T')[0];
      sums[day] = (sums[day] || 0) + i.amount;
    });
    return sums;
  }

  changePeriod(days: number) {
    this.selectedPeriod = days;
    this.loadAllCharts();
  }

  exportCSV(type: 'click' | 'sales' | 'withdrawal') {
    let data = this.clickChartData; // Default
    if (type === 'sales') data = this.salesChartData;
    if (type === 'withdrawal') data = this.withdrawalChartData;

    const ws = XLSX.utils.json_to_sheet(data.labels.map((label: any, i: string | number) => ({
      Date: label,
      Value: data.datasets[0].data[i]
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const filename = `${type}-data-${new Date().toISOString()}.xlsx`;
    FileSaver.saveAs(new Blob([excelBuffer]), filename);
  }

  exportData(section: 'users' | 'requests' | 'clicks' | 'withdrawals' | 'promoCodes') {
    const data = (this as any)[`paginated${section.charAt(0).toUpperCase() + section.slice(1)}`];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, section);
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${section}-report-${timestamp}.xlsx`;
    FileSaver.saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })]), filename);
  }

  async markNotificationResolved(index: number) {
    const resolvedNotification = this.liveNotifications.splice(index, 1)[0];
    try {
      await this.cardService.markNotificationResolved(resolvedNotification.id);
      console.log('Notification marked as resolved');
    } catch (error) {
      console.error('Error marking notification as resolved:', error);
    }
  }

  async clearNotificationHistory() {
    try {
      await this.cardService.clearNotificationHistory();
      this.liveNotifications = [];
      console.log('Notification history cleared');
    } catch (error) {
      console.error('Error clearing notification history:', error);
    }
  }

  // Toggles the visibility of the backup menu
  toggleBackupMenu() {
    this.showBackupMenu = !this.showBackupMenu;
  }

  // Closes the backup menu
  closeBackupMenu() {
    this.showBackupMenu = false;
  }

  async downloadBackup(format: 'json' | 'csv' | 'sql') {
    await this.backupDatabase(format);
    this.closeBackupMenu();
  }

  showNotification = false;
  notificationMessage = '';

  // Displays a visual notification
  displayNotification(message: string) {
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
      this.notificationMessage = '';
    }, 3000); // Notification disappears after 3 seconds
  }

  async backupDatabase(format: 'json' | 'csv' | 'sql') {
    try {
      const backupData = await this.cardService.getDatabaseBackup();

      if (format === 'json') {
        const jsonBlob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
        FileSaver.saveAs(jsonBlob, `database-backup-${new Date().toISOString()}.json`);
      } else if (format === 'csv') {
        const csvData = this.convertToCSV(backupData);
        const csvBlob = new Blob([csvData], { type: 'text/csv' });
        FileSaver.saveAs(csvBlob, `database-backup-${new Date().toISOString()}.csv`);
      } else if (format === 'sql') {
        const sqlData = this.convertToSQL(backupData);
        const sqlBlob = new Blob([sqlData], { type: 'application/sql' });
        FileSaver.saveAs(sqlBlob, `database-backup-${new Date().toISOString()}.sql`);
      }

      this.displayNotification('Backup download completed successfully!');
    } catch (error) {
      console.error('Backup failed:', error);
      this.displayNotification('Backup download failed. Please try again.');
    }
  }

  convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
  }

  convertToSQL(data: any[]): string {
    const tableName = 'backup_table';
    const columns = Object.keys(data[0]).join(', ');
    const values = data
      .map(row => `(${Object.values(row).map(value => `'${value}'`).join(', ')})`)
      .join(',\n');
    return `INSERT INTO ${tableName} (${columns}) VALUES\n${values};`;
  }

  ngOnDestroy(): void {

  }

  async deleteExpiredCodes(): Promise<void> {
    try {
      await this.promoCodeService.deleteExpiredPromoCodes();
      this.promoCodes = await this.promoCodeService.getAllPromoCodes();
      this.totalPromoCodes = this.promoCodes.length;
      this.updatePaginatedData('promoCodes');
      this.displayNotification('Expired promo codes deleted successfully.');
    } catch (error) {
      console.error('Error deleting expired promo codes:', error);
      this.displayNotification('Failed to delete expired promo codes.');
    }
  }

  @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      const dropdown = document.querySelector('.backup-dropdown');
      const toggleBtn = document.querySelector('.btn-backup-toggle');

      if (
        this.showBackupMenu &&
        dropdown &&
        !dropdown.contains(target) &&
        toggleBtn &&
        !toggleBtn.contains(target)
      ) {
        this.closeBackupMenu();
      }
    }
}
