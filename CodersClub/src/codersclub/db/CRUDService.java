/*
Copyright 2010 Will Provost.
All rights reserved by Capstone Courseware, LLC.
*/
package codersclub.db;

import java.util.List;

/**
A generic service that offers CRUD operations for a certain class.

@author Will Provost
*/
public interface CRUDService<T>
{
    /**
    Returns the total number of objects.
    */
    public long getCount ();
    
    /**
    Gets all instances of the managed class.
    */
    public List<T> getAll ();
    
    /**
    Returns the object with the given ID.
    */
    public T getByID (int ID);
    
    /**
    Adds the given object to the list.
    */
    public T add (T newObject);
    
    /**
    Updates the object whose ID matches the given object with the 
    given object's state.
    */
    public T update (T modifiedObject);
    
    /**
    Removes the given object.
    */
    public void remove (T oldObject);

    /**
    Removes the object with the given ID.
    */
    public void removeByID (int ID);
}

