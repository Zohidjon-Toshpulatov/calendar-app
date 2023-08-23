import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import * as moment from 'moment';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  selectedRangeValue: DateRange<Date> = new DateRange<Date>(null, null);
  id: any;
  slots = [
    { id: 0, label: '8:00-9:00' },
    { id: 1, label: '9:00-10:00' },
    { id: 2, label: '10:00-11:00' },
    { id: 3, label: '11:00-12:00' },
    { id: 4, label: '12:00-13:00' },
    { id: 5, label: '13:00-14:00' },
    { id: 6, label: '14:00-15:00' },
    { id: 7, label: '15:00-16:00' },
    { id: 8, label: '16:00-17:00' },
    { id: 9, label: '17:00-18:00' },
  ];

  bookedslots = [];

  selectedSlots: any = [];
  slotsFromApi: any;
  editMode = false;

  constructor(public fb: FormBuilder, private api: ApiService) {}

  ngOnInit() {
    this.getAllSlots();
  }

  timeForm: FormGroup = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    description: [''],
  });

  isDisabled(id: number) {
    return this.selectedSlots.length >= 3 && !this.isSelected(id);
  }

  isSelected(id: number) {
    return this.selectedSlots.find((slot: any) => slot.id === id);
  }

  select(item: any) {
    const index = this.selectedSlots.findIndex(
      (slot: any) => slot.id === item.id
    );
    if (index > -1) {
      this.selectedSlots.splice(index, 1);
    } else {
      this.selectedSlots.push(item);
    }
  }

  onSelectedChange(date: Date) {
    if (!this.selectedRangeValue?.start || this.selectedRangeValue?.end) {
      // If there is no start date or there is already an end date, set the start date to the selected date
      this.selectedRangeValue = new DateRange<Date>(date, null);
    } else {
      // If there is already a start date, set the end date to the selected date
      const start = this.selectedRangeValue.start;
      const end = date;
      if (end < start) {
        // If the end date is before the start date, swap them
        this.selectedRangeValue = new DateRange<Date>(end, start);
      } else {
        // If the end date is after or equal to the start date, keep them as they are
        this.selectedRangeValue = new DateRange<Date>(start, end);
      }
    }

    this.filterSlots(this.selectedRangeValue);
  }

  formatDate(date: Date) {
    return moment(date).format('MMMM Do YYYY');
  }

  addTimeSlot() {
    // if()
    const body = {
      firstname: this.timeForm.value.firstname,
      lastname: this.timeForm.value.lastname,
      description: this.timeForm.value.description,
      dateRangeStart: this.selectedRangeValue.start,
      dateRangeEnd: this.selectedRangeValue.end,
      slots: [...this.selectedSlots],
    };
    if (!this.editMode) {
      this.api.createTimeslot(body).subscribe((data: any) => {
        this.resetData();
        if (data.status) {
          this.getAllSlots();
        }
      });
    } else {
      this.api.updateTimeslot(this.id, body).subscribe((data: any) => {
        this.editMode = !this.editMode;
        this.resetData();
        if (data.status) this.getAllSlots();
      });
    }
  }

  editTimeslot(data: any) {
    this.editMode = true;
    const start = new Date(data.dateRangeStart);
    const end = new Date(data.dateRangeEnd);
    this.timeForm.patchValue({
      firstname: data.firstname,
      lastname: data.lastname,
      desciption: data.description,
    });
    this.selectedSlots = data.slots.map((slot: any) => ({
      id: slot.id,
      label: slot.label,
    }));
    this.id = data._id;
    this.selectedRangeValue = new DateRange<Date>(start, end);
  }

  getTimeslot(id: string) {
    this.api.getTimeslot(id).subscribe((timeSlot: any) => {
      this.selectedRangeValue = new DateRange<Date>(
        timeSlot.dateRangeStart,
        timeSlot.dateRangeEnd
      );
      const slots = timeSlot.slots.map((slot: any) => ({
        id: slot.id,
        label: slot.label,
      }));
      this.selectedSlots = slots;
      this.timeForm.setValue({
        firstname: timeSlot.firstname,
        lastname: timeSlot.lastname,
        description: timeSlot.description,
      });
    });
  }

  deleteSlot(id: string) {
    this.api.deleteTimeslot(id).subscribe((data: any) => {
      if (data.status) {
        this.getAllSlots();
      }
    });
  }

  getAllSlots() {
    this.api.getTimeslots().subscribe((data: any) => {
      this.slotsFromApi = data;
      this.getSeletedDateRanges(data);
    });
  }

  resetData() {
    this.selectedRangeValue = new DateRange<Date>(null, null);
    this.selectedSlots = [];
    this.timeForm.reset();
  }

  getSeletedDateRanges(slotsData: any) {
    this.bookedslots = slotsData.map((slot: any) => {
      return {
        id: slot._id,
        dateRange: {
          start: new Date(slot.dateRangeStart),
          end: new Date(slot.dateRangeStart),
        },
        slots: slot.slots,
      };
    });
  }

  filterSlots(dateRange: any) {
    const filterSlots = this.slotsFromApi
      .filter((slot: any) => {
        const start = new Date(slot.dateRangeStart);
        const end = new Date(slot.dateRangeEnd);
        return start <= dateRange.end && end >= dateRange.start;
      })
      .map((slot: any) => slot.slots)
      .flat(1);

    this.slots = this.slots.filter(
      (slot) =>
        filterSlots.findIndex((aSlot: any) => aSlot.id === slot.id) === -1
    );
  }
}
