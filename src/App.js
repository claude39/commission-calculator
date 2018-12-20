import React, { Component } from 'react';
import './App.css';
import { Grid, Button, List, ListItem } from '@material-ui/core'
import XLSX from 'xlsx'
import FileDrop from 'react-file-drop';
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";

const localizer = BigCalendar.momentLocalizer(moment)

class EventComponent extends React.Component {

  render() {
    return <div style={{ height: 20, backgroundColor: this.props.event.color }}>{this.props.title}</div>
  }
}

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      data: [],
      events: [],
      resorceMap: [],
      refresh: false,
      fileName: 'No file',
      startDate: new Date(),
      endDate: new Date(),
      result: []
    }
    this.getEventsWithinRange = this.getEventsWithinRange.bind(this)
    this.handleChangeStart = this.handleChangeStart.bind(this)
    this.handleChangeEnd = this.handleChangeEnd.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.getRandomColor = this.getRandomColor.bind(this)
    this.fillUpEvents = this.fillUpEvents.bind(this)
    this.refreshCalendar = this.refreshCalendar.bind(this)

    this.dates = {
      convert: function (d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp) 
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
          d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0], d[1], d[2]) :
              d.constructor === Number ? new Date(d) :
                d.constructor === String ? new Date(d) :
                  typeof d === "object" ? new Date(d.year, d.month, d.date) :
                    NaN
        );
      },
      compare: function (a, b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
          isFinite(a = this.convert(a).valueOf()) &&
            isFinite(b = this.convert(b).valueOf()) ?
            (a >= b) - (a <= b) :
            NaN
        );
      },
      inRange: function (d, start, end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
        return (
          isFinite(d = this.convert(d).valueOf()) &&
            isFinite(start = this.convert(start).valueOf()) &&
            isFinite(end = this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
      }
    }
  }

  handleChangeStart(date) {
    this.setState({
      startDate: date
    });
  }

  handleChangeEnd(date) {
    this.setState({
      endDate: date
    });
  }

  handleDrop = (files, event) => {
    let f = files[0]
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      await this.setState({ fileName: f.name })
      await this.setState({ data: data })
      await this.fillUpEvents()
      await this.refreshCalendar()
    };
    reader.readAsBinaryString(f);
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getDateFormat = (date) => {
    return new Date(date).toLocaleDateString()
  }

  fillUpEvents = () => {
    for (let i = 0; i < this.state.data.length; i++) {
      let item = this.state.data[i]
      this.state.events.push({
        id: i,
        title: item["Booker name"],
        start: new Date(item.Arrival),
        end: new Date(item.Departure),
        color: this.getRandomColor()
      })
    }
  }

  refreshCalendar() {
    this.setState({ refresh: !this.state.refresh })
  }

  getEventsWithinRange() {
    for (let x = 0; x < this.state.data.length; x++) {
      if (this.dates.inRange(this.state.data[x].Arrival, this.state.startDate, this.state.endDate) && this.dates.inRange(this.state.data[x].Departure, this.state.startDate, this.state.endDate)) {
        this.state.result.push(this.state.data[x])
      }
    }
    this.refreshCalendar()
  }

  render() {
    return (
      <Grid style={{ paddingTop: 30 }}>
        <Grid container spacing={24}>
          <Grid item xs={1} id="react-file-drop-demo" style={{ border: '1px solid black', maxHeight: 100, color: 'black', padding: 20, margin: 10, borderRadius: 15 }}>
            <FileDrop onDrop={this.handleDrop}>
              <Grid style={{ alignContent: 'center', alignItems: 'center' }}>
                Drop .xls file here!
              </Grid>
            </FileDrop>
          </Grid>
          <Grid item style={{ maxHeight: 100 }}>
            <Grid style={{ paddingTop: 30 }}>
              {this.state.fileName}
            </Grid>
          </Grid>
          <Grid item style={{ flex: 1, padding: 10, height: 500 }}>
            <BigCalendar
              events={this.state.events}
              localizer={localizer}
              defaultView={BigCalendar.Views.MONTH}
              views={['month', 'day']}
              step={60}
              defaultDate={new Date()}
              resourceIdAccessor="resourceId"
              resourceTitleAccessor="resourceTitle"
              components={{
                event: EventComponent
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={24}>
          <Grid item xs={5} />
          <Grid style={{ margin: 20 }}>
            Start Date:
            <DatePicker
              selected={this.state.startDate}
              onChange={this.handleChangeStart}
            />
          </Grid>
          <Grid style={{ margin: 20 }}>
            End Date:
            <DatePicker
              selected={this.state.endDate}
              onChange={this.handleChangeEnd}
            />
          </Grid>
          <Button onClick={this.getEventsWithinRange} color={"primary"}>Calculate</Button>
          <Grid item xs={5} />
        </Grid>
        {this.state.result.length &&
          <Grid style={{ fontSize: 20 }}>
            Total Commission for period {this.getDateFormat(this.state.startDate)} - {this.getDateFormat(this.state.endDate)}
            <List>
              {console.log(this.state.result)}
              {
                this.state.result.map(res => (
                  <ListItem>
                    {res['Booker name']}{res.Commission}
                  </ListItem>
                ))
              }
            </List>
          </Grid>
        }
      </Grid>
    );
  }
}

export default App;
