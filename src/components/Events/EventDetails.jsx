import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';
import { useState } from 'react';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error} = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  });

  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting, error: deleteError } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      });
      navigate('/events');
    }
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id: params.id });
  }

  let content;

  if(isPending){
    content = (
      <div id='event-details-content' className='center'>
        <p>Fetching event data...</p>
      </div>
    );
  }

  if(isError){
    content = (
      <div id='event-details-content' className='center'>
        <ErrorBlock
          title='Failed to load event'
          message={error.info?.message || 'Failed to fetch event data, please try again later.'}
        />
      </div>
    );
  }

  if(data){
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    content = (
      <>
        <header className='event-header'>
          <h1 className='event-title'>{data.title}</h1>
          <nav className='event-actions'>
            <button onClick={handleStartDelete} className='delete'>Delete</button>
            <Link to="edit" className='button'>Edit</Link>
          </nav>
        </header>
      
        <div id="event-details-content" className='event-content'>
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} className='event-image' />
          <div id="event-details-info" className='event-info'>
            <div>
              <p id="event-details-location" className='event-location'>{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`} className='event-time'>{formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description" className='event-description'>{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event? This action cannot be undone.</p>
          <div className='form-actions'>
            {isPendingDeletion && <p>Deleting, please wait...</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleStopDelete} className='button-text'>Cancel</button>
                <button onClick={handleDelete} className='button'>Delete</button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title='Failed to delete event'
              message={deleteError.info?.message || 'Failed to delete event, Please try again later.'}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">View all Events</Link>
      </Header>
      <article id="event-details" className='event-details'>
        {content}
      </article>
    </>
  );
}
