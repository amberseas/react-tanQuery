import {useState} from 'react';
import {Link, Outlet, useNavigate, useParams} from 'react-router-dom';
import {useMutation, useQuery} from '@tanstack/react-query';

import {deleteEvent, fetchEvent, queryClient} from '../../util/http.js';
import Header from '../Header.jsx';
import Modal from '../UI/Modal.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EventDetails () {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const {id} = useParams();
  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', {id}],
    queryFn: ({signal}) => fetchEvent({id, signal})
  });
  const {mutate, isPending: deletePending, isError: isDeletionError, error: deletionError} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['events'], refetchType: 'none'});
      navigate('/events');
    }
  });

  const handleStartDeletion = () => {
    setIsDeleting(true);
  };
  const handleCancelDeletion = () => {
    setIsDeleting(false);
  };

  const handleDeleteEvent = () => {
    mutate({id});
  };
  return (
    <>
      {isDeleting && <Modal onClose={handleCancelDeletion}>
        <h2>Are you sure?</h2>
        <p>This action cannot be undone.</p>
        <div className="form-actions">
          {deletePending ? <LoadingIndicator /> :
            <>
              <button onClick={handleCancelDeletion} className='button-text'>Cancel</button>
              <button onClick={handleDeleteEvent} className='button'>Delete</button>
            </>}
        </div>
        {isDeletionError && <ErrorBlock title='An error occurred.' message={deletionError.info?.message || 'Try again later.'} />}
      </Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && <div id='event-details-content' className='center'><p>Loading event...</p></div>}
      {isError && <div id='event-details-content' className='center'><ErrorBlock title="An error occurred." message={error.info?.message || 'Failed to fetch events'} /></div>}
      {/* {deletePending && <div id='event-details-content' className='center'><LoadingIndicator /></div>} */}
      {data && <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDeletion}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={'http://localhost:3000/' + data.image} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>}
    </>
  );
}
