# indivisible-server
server responsible for the interface between THP and Indivisible 

### Why isn't this actionkit event showing up on the map?

1. It doesn't have an issue focus
- custom field `event_issue_focus`
2. It is a recurring event and is more than 3 months in the future
- Recurring events have custom field `is_recurring==='Yes'`
3. It is in the past
4. The host is not confirmed 
- field `host_is_confirmed` must be true to be shown on map
5. Status is not either "active" or "new"
6. The event s private
- field `is_private` must be false to be shown on map
7. The postal code is either 20301 or 000840
8. The address is 'This event is virtual, Washington, DC 20301'
9. Is a virtual event:
- the event has a custom field `is_virtual_event`. This was used for events that shouldn't show up on the map (pre COVID). This is different from `event_virtual_status===digital` which will show up on the map. 
